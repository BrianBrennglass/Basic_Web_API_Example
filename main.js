
const BASE_URL = "https://jsonplaceholder.typicode.com/";


const table = document.getElementById('centralTable');
let tableHead = table.getElementsByTagName('thead')[0];
let tableBody = table.getElementsByTagName('tbody')[0];
const loader = document.getElementsByClassName("loading")[0];
const failureWarning =  document.getElementsByClassName("failure-warning")[0];
const tryAgainButton = document.getElementById('try-again');
const backButton = document.createElement('button');

const recurseSubObject = (subObj,tr, endpoint, setHeading = false)=>{
    let colspan = 0;
    
    let theadTr;
    if(setHeading){
        theadTr = document.createElement('tr');
        tableHead.appendChild(theadTr);
    }
    for(let [key, value] of Object.entries(subObj)){
        if(value === Object(value))
            colspan += recurseSubObject(value, tr);
        else{
            let td = document.createElement('td')
            td.innerText = value;
            td.title = key;
            if(key === 'id' && endpoint === 'users'){
                td.style.textDecoration = 'underline';
                td.style.color = 'blue';
                td.style.cursor = 'pointer';
                td.addEventListener('click', ()=>populateUserTable(`posts/?userId=${subObj.id}`,2 ))
            }
            tr.appendChild(td);
            colspan++;
        }
        if(setHeading){
            const th = document.createElement('th')
            theadTr.appendChild(th);
            th.colSpan = colspan;
            th.innerText = key;
            colspan = 0;
        }
    }
    return colspan;
}
const recurseJsonTree = (json, endpoint)=>{
    table.removeChild(tableHead);
    table.removeChild(tableBody);
    tableBody = document.createElement('tbody');
    tableHead = document.createElement('thead');
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    let setHeading = true;
    for(let obj of json){
        const tr = document.createElement('tr');
        recurseSubObject(obj, tr, endpoint, setHeading)
        tableBody.appendChild(tr);
        setHeading = false;
    }
}
const populateUserTable = async (endpoint, attemptsAllowed)=>{
    if(!attemptsAllowed){
        loader.classList.remove('begin-loading');
        failureWarning.classList.add('show-warning');
        return null;
    }
    try{
        const response = await fetch(BASE_URL +  endpoint);
        const data = await response.json();
        if(response.status === 200){
            endpoint !== 'users'? displayBackButton() : hideBackButton();
            recurseJsonTree(data, endpoint);
        }
        else{
            loader.classList.add('begin-loading');
            populateUserTable(endpoint, --attemptsAllowed);
        }
    }
    catch(e){
        
        loader.classList.add('begin-loading');
        populateUserTable(endpoint, --attemptsAllowed);
    }
}

populateUserTable('users', 3);

tryAgainButton.addEventListener('click', ()=>{
    failureWarning.classList.remove('show-warning');
    populateUserTable('users', 3)
})

function displayBackButton(){
    backButton.style.display = 'inline-block';
    backButton.innerText = "display users";
    backButton.addEventListener('click', ()=>populateUserTable('users',3));
    document.getElementById('header-container').appendChild(backButton);
}
function hideBackButton(){
    backButton.style.display = 'none';
}