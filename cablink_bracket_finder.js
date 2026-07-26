#!/usr/bin/env node
/**
 * ============================================================
 *  CABLINK BRACKET FINDER
 *  cablink_bracket_finder.js
 * ============================================================
 *
 * Purpose: pinpoint exactly where a brace/paren/bracket imbalance
 * happens in a JS block, instead of trusting node's own error line
 * (which for mismatched-brace bugs is often hundreds of lines past
 * the real mistake, since the parser doesn't notice until it hits
 * something that finally can't make sense).
 *
 * It:
 *  1. Walks the file character-by-character (correctly skipping
 *     string/template-literal contents and comments, so a "}"
 *     inside a message string doesn't get mistaken for real code).
 *  2. Reports the exact line of any "closing bracket with no
 *     matching open" — this is the unambiguous, actionable signal
 *     for an extra/misplaced closing brace bug.
 *  3. Reports anything left unclosed at end-of-file (missing
 *     closing brace bugs).
 *  4. Lists every top-level `function NAME(){...}` found, with its
 *     REAL matched start/end line (computed by depth-counting from
 *     its own opening brace) — so you can visually spot one whose
 *     reported end looks wrong (e.g. way too short, or swallowing
 *     code that clearly isn't part of it).
 *
 * Usage:
 *   node cablink_bracket_finder.js <file>            (whole file)
 *   node cablink_bracket_finder.js <file> <startLine> <endLine>
 *       (only that line range — use this for one big <script> block
 *        inside an .html file, e.g. the range reported by
 *        cablink_full_audit.js's syntax-health section)
 *
 * Makes ZERO changes to any file.
 */

const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node cablink_bracket_finder.js <file> [startLine endLine]');
  process.exit(1);
}
const filePath = args[0];
const startLineArg = args[1] ? parseInt(args[1], 10) : null;
const endLineArg = args[2] ? parseInt(args[2], 10) : null;

if (!fs.existsSync(filePath)) {
  console.error('File not found: ' + filePath);
  process.exit(1);
}

const fullContent = fs.readFileSync(filePath, 'utf8');
const allLines = fullContent.split('\n');

let content, lineOffset;
if (startLineArg) {
  const s = Math.max(1, startLineArg);
  const e = endLineArg ? Math.min(allLines.length, endLineArg) : allLines.length;
  content = allLines.slice(s - 1, e).join('\n');
  lineOffset = s - 1; // add this to any 1-based line number computed within `content`
  console.log(`Scanning lines ${s}-${e} of ${filePath} (${e - s + 1} lines)`);
} else {
  content = fullContent;
  lineOffset = 0;
  console.log(`Scanning entire file ${filePath} (${allLines.length} lines)`);
}

// ---------------------------------------------------------------
// BRACKET-DEPTH SCANNER (string/template/comment aware)
// ---------------------------------------------------------------

const openToClose = { '(': ')', '{': '}', '[': ']' };
const closeToOpen = { ')': '(', '}': '{', ']': '[' };

function scan(src) {
  let mode = 'NORMAL'; // NORMAL, STR1, STR2, TEMPLATE, LINE_COMMENT, BLOCK_COMMENT
  const stack = []; // {char, line, returnMode}
  const extraClosings = [];
  const mismatches = [];
  let line = 1;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];

    if (c === '\n') {
      line++;
      if (mode === 'LINE_COMMENT') mode = 'NORMAL';
      continue;
    }

    if (mode === 'LINE_COMMENT') continue;

    if (mode === 'BLOCK_COMMENT') {
      if (c === '*' && next === '/') { i++; mode = 'NORMAL'; }
      continue;
    }

    if (mode === 'STR1') {
      if (c === '\\') { i++; continue; }
      if (c === "'") mode = 'NORMAL';
      continue;
    }

    if (mode === 'STR2') {
      if (c === '\\') { i++; continue; }
      if (c === '"') mode = 'NORMAL';
      continue;
    }

    if (mode === 'TEMPLATE') {
      if (c === '\\') { i++; continue; }
      if (c === '`') { mode = 'NORMAL'; continue; }
      if (c === '$' && next === '{') {
        stack.push({ char: '{', line, returnMode: 'TEMPLATE' });
        mode = 'NORMAL';
        i++;
        continue;
      }
      continue;
    }

    // mode === NORMAL
    if (c === '/' && next === '/') { mode = 'LINE_COMMENT'; i++; continue; }
    if (c === '/' && next === '*') { mode = 'BLOCK_COMMENT'; i++; continue; }
    if (c === "'") { mode = 'STR1'; continue; }
    if (c === '"') { mode = 'STR2'; continue; }
    if (c === '`') { mode = 'TEMPLATE'; continue; }

    if (c === '{' || c === '(' || c === '[') {
      stack.push({ char: c, line, returnMode: null });
      continue;
    }

    if (c === '}' || c === ')' || c === ']') {
      const expectedOpen = closeToOpen[c];
      if (stack.length === 0) {
        extraClosings.push({ char: c, line });
        continue;
      }
      const top = stack[stack.length - 1];
      if (top.char !== expectedOpen) {
        mismatches.push({
          expectedClose: openToClose[top.char], found: c, line,
          openedAtLine: top.line, openedChar: top.char
        });
        stack.pop(); // recover so we can keep scanning past this point
        continue;
      }
      const popped = stack.pop();
      if (popped.returnMode === 'TEMPLATE') mode = 'TEMPLATE';
      continue;
    }
  }

  const unclosed = stack.map(f => ({ char: f.char, line: f.line }));
  return { extraClosings, mismatches, unclosed };
}

// ---------------------------------------------------------------
// TOP-LEVEL FUNCTION SPAN FINDER
// ---------------------------------------------------------------

function findFunctionSpans(src) {
  const spans = [];
  const fnRe = /\bfunction\s+(\w+)\s*\(/g;
  let m;
  while ((m = fnRe.exec(src)) !== null) {
    const name = m[1];
    const startLine = src.slice(0, m.index).split('\n').length;
    const openBraceIdx = src.indexOf('{', m.index);
    if (openBraceIdx === -1) continue;
    const endLine = findMatchingBraceLine(src, openBraceIdx);
    spans.push({ name, startLine, endLine });
  }
  return spans;
}

// Stack/mode-aware matcher: finds the true matching '}' for a known
// '{' at openBraceIdx, using the SAME correct tokenizer as scan()
// (proper ${...} template-expression tracking via returnMode), so
// template literals containing braces don't throw off the count.
function findMatchingBraceLine(src, openBraceIdx) {
  let mode = 'NORMAL';
  const stack = [{ char: '{', returnMode: null }]; // the brace we're matching
  let line = src.slice(0, openBraceIdx).split('\n').length;

  for (let i = openBraceIdx + 1; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];

    if (c === '\n') { line++; if (mode === 'LINE_COMMENT') mode = 'NORMAL'; continue; }
    if (mode === 'LINE_COMMENT') continue;
    if (mode === 'BLOCK_COMMENT') { if (c === '*' && next === '/') { i++; mode = 'NORMAL'; } continue; }
    if (mode === 'STR1') { if (c === '\\') { i++; continue; } if (c === "'") mode = 'NORMAL'; continue; }
    if (mode === 'STR2') { if (c === '\\') { i++; continue; } if (c === '"') mode = 'NORMAL'; continue; }
    if (mode === 'TEMPLATE') {
      if (c === '\\') { i++; continue; }
      if (c === '`') { mode = 'NORMAL'; continue; }
      if (c === '$' && next === '{') {
        stack.push({ char: '{', returnMode: 'TEMPLATE' });
        mode = 'NORMAL';
        i++;
        continue;
      }
      continue;
    }

    if (c === '/' && next === '/') { mode = 'LINE_COMMENT'; i++; continue; }
    if (c === '/' && next === '*') { mode = 'BLOCK_COMMENT'; i++; continue; }
    if (c === "'") { mode = 'STR1'; continue; }
    if (c === '"') { mode = 'STR2'; continue; }
    if (c === '`') { mode = 'TEMPLATE'; continue; }

    if (c === '{' || c === '(' || c === '[') {
      stack.push({ char: c, returnMode: null });
      continue;
    }
    if (c === '}' || c === ')' || c === ']') {
      if (stack.length === 0) continue; // unbalanced elsewhere; not our concern here
      const popped = stack.pop();
      if (popped.returnMode === 'TEMPLATE') mode = 'TEMPLATE';
      if (stack.length === 0) return line; // closed our original brace
      continue;
    }
  }
  return null; // never closes within the scanned range
}

// ---------------------------------------------------------------
// RUN
// ---------------------------------------------------------------

const result = scan(content);

console.log('');
console.log('=== BRACKET BALANCE ===');
if (result.extraClosings.length === 0 && result.mismatches.length === 0 && result.unclosed.length === 0) {
  console.log('✅ Perfectly balanced — no extra, missing, or mismatched brackets found.');
} else {
  result.extraClosings.forEach(e => {
    console.log(`❌ Line ${e.line + lineOffset}: closing "${e.char}" with NO matching open — one bracket too many closes by this point.`);
  });
  result.mismatches.forEach(e => {
    console.log(`❌ Line ${e.line + lineOffset}: found "${e.found}" but expected "${e.expectedClose}" (to close the "${e.openedChar}" opened at line ${e.openedAtLine + lineOffset}).`);
  });
  result.unclosed.forEach(u => {
    console.log(`❌ Line ${u.line + lineOffset}: "${u.char}" opened here is NEVER closed by end of the scanned range — missing a closing "${openToClose[u.char]}" somewhere after this.`);
  });
}

console.log('');
console.log('=== TOP-LEVEL FUNCTION SPANS (for visual sanity-check) ===');
const spans = findFunctionSpans(content);
spans.forEach(s => {
  const realStart = s.startLine + lineOffset;
  const realEnd = s.endLine !== null ? s.endLine + lineOffset : null;
  const span = realEnd !== null ? (realEnd - realStart) : null;
  const flag = span !== null && span < 2 ? '  ⚠️ suspiciously short' : (realEnd === null ? '  ⚠️ NEVER CLOSES in scanned range' : '');
  console.log(`  ${s.name}: line ${realStart} -> ${realEnd !== null ? realEnd : '???'}${flag}`);
});

console.log('');
console.log('Made zero changes to any file.');
