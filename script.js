run = true
generation = 1
function findcell(row, col){
  return document.getElementsByClassName("tr"+row.toString())[0].getElementsByTagName("td")[col-1]

}
function colorcell(row,col,color){
  if(row < 21 && col < 21 && row > 0 && col > 0){
    findcell(row,col).style.backgroundColor = color
  }
}

//Minnows are smart, have a "brain"
class Minnow {
  constructor(brain){
    colorcell(10,1,"orange")
    this.coords = [10,1]
    if(brain!="none"){
      this.brain=brain
    } else {
      this.brain=[]
      for(let i=0;i<80;i++){
        this.brain.push(Math.floor(Math.random() * 4))
      }
    }
    this.fitness = 0
    this.dead = false
  }
  
  move(newr,newc){
    colorcell(this.coords[0],this.coords[1],"white")
    colorcell(newr,newc,"orange")
    this.coords = [newr,newc]
}

  delete(){
    colorcell(this.coords[0],this.coords[1],"white")
  }

  execute(index){
    if(index>79){
      run = false
      calculatesurvivalrate()
    }
    if (index > 79 || this.dead){
      this.fitness = 20 - this.coords[1]
      colorcell(this.coords[0],this.coords[1],"grey")
      return
    }
    
    let direction = this.brain[index]
    //console.log(index, this.brain)
    switch(direction){
      case 0:
        if(this.coords[0] + 1 < 21){
          this.move(this.coords[0] + 1,this.coords[1])
        }
        break;
      case 1:
        this.move(this.coords[0],this.coords[1] + 1)
        break;
      case 2:
        if(this.coords[0] - 1 > 0){
          this.move(this.coords[0] - 1,this.coords[1])
          
        }
        break;
      case 3:
        if(this.coords[1] - 1 > 0){
          this.move(this.coords[0],this.coords[1] - 1)
          
        }
        break;
    }
 
    if(this.coords[1]==20){
      this.dead = true
    }
  }
}

//the sharks are dumb and who can only move forward

class Shark {
  constructor(row,col){
    colorcell(row,col,"blue")
    this.coords = [row,col]
  }

  move(){
    colorcell(this.coords[0],this.coords[1],"white")
    colorcell(this.coords[0] + 1,this.coords[1],"blue")
    this.coords[0]+=1
  }
}

class Population{
  constructor(){
    this.population = []
    this.sortedpopulation = []
    for(let i=0;i<100;i++){
      this.population.push(new Minnow("none"))
    }
  }
}
pop = new Population()
sharks = []
for(let i=1; i<11; i++){
  sharks.push(new Shark(1, 2*i))
}
//console.log(minnow.brain)
index = 0
window.setInterval(function(){
  if(run){
    if(index%4==0){
      for (let i=0; i<10; i++){
        sharks[i].move()
      }
    } else if(index%3==0){
      for (let i=0; i<5; i++){
        sharks[i*2].move()
      }
    } else if (index%2==0){
      for (let i=0; i<2; i++){
        sharks[i*5 + 3].move()
      }
    } else {
      sharks[7].move()
      sharks[3].move()
    }
    z = 100

    for(let i=0;i<z;i++){
      pop.population[i].execute(index)
    }
    index++
    if(index>79){
      calculatesurvivalrate()
    }
    //console.log(index,minnow.dead)
    for(let i=0;i<z;i++){
      minnow = pop.population[i]
      for (let i=0; i<10; i++){

        if(minnow.coords[0] == sharks[i].coords[0] && minnow.coords[1] == sharks[i].coords[1]){
          minnow.dead=true
        }
      }
    }
  }
}, 1)

function calculatesurvivalrate(){
  alive = 0
  fit = 0
  z = 100
  
  for (let i=0; i<z; i++){
    if (pop.population[i].dead == false){
      alive+=1
    }
  }
  for (let i=0; i<z; i++){
    if (pop.population[i].fitness == 0){
      alive+=1
      fit += 1
      console.log("hey", i)
    }
  }
  document.getElementById("report").innerText = alive+" alive, "+fit+" reached the end."
}


function newgeneration(){
  sortedpopulation = []
  brainlist = []
  fitnesslist = []
  for (let i=0; i<100; i++){
    brainlist.push(pop.population[i].brain)
    fitnesslist.push(pop.population[i].fitness)
  }
  best = 100
  besti = 0
  for (let i=0; i<100; i++){
    if (fitnesslist[i] < best) {
      best = fitnesslist[i]
      besti = i
    }
  }
  console.log ("Winner = ", besti)
  console.log(pop.population[besti])
  for (let i=0; i<100; i++){
    pop.population[i].delete()
  }
  pop.population = []
  newlist = []
  for (let i=0; i<100; i++){
    newlist.push([fitnesslist[i],brainlist[i]])
  }
  newlist.sort(function(a,b){
    return a[0]-b[0]
  })

fitnesslist = []
  brainlist = []
  for (let i=0; i<100; i++){
    brainlist.push(newlist[i][1])
    fitnesslist.push(newlist[i][0])
  }
  //console.log(fitnesslist)
  //console.log(brainlist)
  newbrainlist = []
  for (let i=0; i<50; i++){
    newbrainlist.push(brainlist[i])
  }
  mutatedbrainlist=structuredClone(brainlist)
  for (let i=0; i<50; i++){
    newbrainlist.push(mutate(mutatedbrainlist[i%50]))
  }

  //console.log(newbrainlist)
  for(let i=0;i<100;i++){
    pop.population.push(new Minnow(newbrainlist[i]))
  }
  for(let i=1; i<11; i++){
    sharks[i-1].coords = [0, 2*i]
    sharks[i-1].move()
  }
  generation++
  document.getElementById("generation").innerText = "Generation " + generation
  index = 0
  //console.log(pop.population)
  run = true
}

function mutate(brain){
  newbrain = brain
  for (let i=0; i<80; i++){
    if(Math.floor(Math.random() * 51) == 28){
      newbrain[i] = Math.floor(Math.random() * 4)
    }
  }
  return newbrain
}
