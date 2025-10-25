// --- Elements ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const tasksContainer = document.getElementById("tasksContainer");
const promptsContainer = document.getElementById("promptsContainer");
const copiedMsg = document.getElementById("copiedMsg");
const uploadJson = document.getElementById("uploadJson");

// --- Tâches stockées localement ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Afficher les tâches ---
function renderTasks() {
  tasksContainer.innerHTML = "";
  tasks
    .slice()
    .sort((a,b)=> new Date(a.date) - new Date(b.date))
    .forEach(task=>{
      const li = document.createElement("li");
      li.textContent = task.text + " (ajoutée le " + task.date.split("T")[0] + ")";
      tasksContainer.appendChild(li);
    });
}

// --- Ajouter une tâche ---
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if(text !== "") {
    tasks.push({text, date: new Date().toISOString()});
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value = "";
    renderTasks();
  } else alert("Merci d’entrer une tâche !");
});

// --- Archiver JSON ---
archiveBtn.addEventListener("click", () => {
  if(tasks.length === 0) { alert("Aucune tâche à archiver !"); return; }
  const blob = new Blob([JSON.stringify(tasks,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// --- Prompts intégrés avec labels courts ---
const prompts = [
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];

// --- Créer boutons prompts ---
prompts.forEach(p=>{
  const btn = document.createElement("button");
  btn.textContent = p.label; // label court
  btn.addEventListener("click", ()=>{
    // Copier prompt + tâches
    const combined = p.text + "\n\n" + tasks.map(t=>"- "+t.text).join("\n");
    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block";
      setTimeout(()=>copiedMsg.style.display="none",2000);

      // Ouvre ChatGPT dans un nouvel onglet
      window.open("https://chatgpt.com/", "_blank");
    });
  });
  promptsContainer.appendChild(btn);
});

// --- Upload JSON ---
uploadJson.addEventListener("change", event=>{
  const files = Array.from(event.target.files);
  if(!files.length) return;
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = e=>{
      try{
        const data = JSON.parse(e.target.result);
        if(Array.isArray(data)){
          data.forEach(item=>{
            if(item.text && item.date) tasks.push({text:item.text, date:item.date});
          });
          localStorage.setItem("tasks", JSON.stringify(tasks));
          renderTasks();
        }
      }catch(err){
        console.error("Erreur lecture JSON:", err);
      }
    };
    reader.readAsText(file);
  });
});

// --- Initial render ---
renderTasks();
