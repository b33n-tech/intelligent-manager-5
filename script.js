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

// --- Affichage sidebar avec clic + survol ---
function renderTasks() {
  tasksContainer.innerHTML = "";
  tasks
    .slice()
    .sort((a,b)=> new Date(a.date) - new Date(b.date))
    .forEach((task, index)=>{
      const li = document.createElement("li");
      li.className = "task-item";

      // Texte tâche
      const taskText = document.createElement("div");
      taskText.className = "task-text";
      taskText.textContent = task.text + " (ajoutée le " + task.date.split("T")[0] + ")";
      taskText.style.cursor = "pointer";

      // Tooltip pour survol des commentaires
      if(task.comments?.length){
        taskText.title = task.comments.map(c=>"• "+c).join("\n");
      }

      // Bloc commentaire caché initialement
      const commentBlock = document.createElement("div");
      commentBlock.className = "comment-section";
      commentBlock.style.display = "none";

      // Liste commentaires
      const commentList = document.createElement("ul");
      commentList.className = "comment-list";
      if(task.comments?.length){
        task.comments.forEach(c=>{
          const cLi = document.createElement("li");
          cLi.textContent = c;
          commentList.appendChild(cLi);
        });
      }
      commentBlock.appendChild(commentList);

      // Input + bouton ajout commentaire
      const commentInputDiv = document.createElement("div");
      commentInputDiv.className = "comment-input";
      const commentInput = document.createElement("input");
      commentInput.placeholder = "Ajouter un commentaire…";
      const commentBtn = document.createElement("button");
      commentBtn.textContent = "+";

      commentBtn.addEventListener("click", ()=>{
        const val = commentInput.value.trim();
        if(val!==""){
          if(!task.comments) task.comments=[];
          task.comments.push(val);
          localStorage.setItem("tasks", JSON.stringify(tasks));
          commentInput.value="";
          renderTasks();
        }
      });

      commentInputDiv.appendChild(commentInput);
      commentInputDiv.appendChild(commentBtn);
      commentBlock.appendChild(commentInputDiv);

      li.appendChild(taskText);
      li.appendChild(commentBlock);

      // Clic pour afficher / cacher le bloc commentaire
      taskText.addEventListener("click", ()=>{
        commentBlock.style.display = commentBlock.style.display === "none" ? "flex" : "none";
      });

      tasksContainer.appendChild(li);
    });
}

// --- Ajouter tâche ---
addBtn.addEventListener("click", ()=>{
  const text = taskInput.value.trim();
  if(text!==""){
    tasks.push({text, date:new Date().toISOString(), comments:[]});
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value="";
    renderTasks();
  }
});

// --- Archiver JSON ---
archiveBtn.addEventListener("click", ()=>{
  if(tasks.length===0){ alert("Aucune tâche à archiver !"); return; }
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

// --- Prompts ---
const prompts = [
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];

prompts.forEach(p=>{
  const btn = document.createElement("button");
  btn.textContent = p.label;
  btn.addEventListener("click", ()=>{
    const combined = p.text + "\n\n" + tasks.map(t=>{
      let str = "- "+t.text;
      if(t.comments?.length){
        str += "\n  Commentaires :\n" + t.comments.map(c=>"    - "+c).join("\n");
      }
      return str;
    }).join("\n");
    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block";
      setTimeout(()=>copiedMsg.style.display="none",2000);
      window.open("https://chatgpt.com/", "_blank");
    });
  });
  promptsContainer.appendChild(btn);
});

// --- Upload JSON ---
uploadJson.addEventListener("change", event=>{
  const files = Array.from(event.target.files);
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = e=>{
      try{
        const data = JSON.parse(e.target.result);
        if(Array.isArray(data)){
          data.forEach(item=>{
            if(item.text && item.date){
              if(!item.comments) item.comments=[];
              tasks.push({text:item.text, date:item.date, comments:item.comments});
            }
          });
          localStorage.setItem("tasks", JSON.stringify(tasks));
          renderTasks();
        }
      }catch(err){ console.error("Erreur lecture JSON:", err); }
    };
    reader.readAsText(file);
  });
});

// --- Initial render ---
renderTasks();
