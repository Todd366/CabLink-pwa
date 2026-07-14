const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK REACT DEPENDENCY GRAPH
=========================================
`);

function walk(dir,list=[]){
    if(!fs.existsSync(dir)) return list;

    for(const item of fs.readdirSync(dir)){
        const full=path.join(dir,item);

        if(fs.statSync(full).isDirectory()){
            walk(full,list);
        }else{
            if(full.endsWith(".js")||full.endsWith(".jsx"))
                list.push(full);
        }
    }

    return list;
}

const files=walk("frontend");

const graph={};
const visited=new Set();

function normalize(base,imp){

    if(!imp.startsWith(".")) return null;

    let p=path.normalize(path.join(path.dirname(base),imp));

    const exts=["",".js",".jsx"];

    for(const e of exts){

        let f=p+e;

        if(fs.existsSync(f))
            return f;

        if(fs.existsSync(path.join(p,"index.js")))
            return path.join(p,"index.js");

        if(fs.existsSync(path.join(p,"index.jsx")))
            return path.join(p,"index.jsx");
    }

    return null;
}

for(const file of files){

    const code=fs.readFileSync(file,"utf8");

    graph[file]=[];

    const regex=/import\s+.*?\s+from\s+["'](.+?)["']/g;

    let m;

    while((m=regex.exec(code))!==null){

        const dep=normalize(file,m[1]);

        if(dep)
            graph[file].push(dep);

    }

}

function visit(file){

    if(visited.has(file))
        return;

    visited.add(file);

    (graph[file]||[]).forEach(visit);

}

visit("frontend/main.jsx");

const connected=[];
const disconnected=[];

files.forEach(f=>{

    if(visited.has(f))
        connected.push(f);
    else
        disconnected.push(f);

});

const report={
connected,
disconnected,
graph
};

fs.writeFileSync(
"CABLINK_DEPENDENCY_GRAPH.json",
JSON.stringify(report,null,2)
);

console.log("\nConnected Files:",connected.length);
console.log("Disconnected Files:",disconnected.length);

console.log("\nCONNECTED");
connected.forEach(f=>console.log("✓",f));

console.log("\nDISCONNECTED");
disconnected.forEach(f=>console.log("•",f));

console.log(`
=========================================
Saved:

CABLINK_DEPENDENCY_GRAPH.json
=========================================
`);

