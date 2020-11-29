var database
var dog, happyDogImg,feedMeDogImg, gameState, garden, washroom, bg


var fedTime, lastFed
var feedPetButton, addFoodButton
var foodObj, lastFedHour, gardenHour, washroomHour, hournumber

function preload(){
  happyDogImg = loadImage("images/happilyFed.png")
  feedMeDogImg = loadImage("images/feedMe.png")
  garden = loadImage("images/Garden.png")
  washroom = loadImage("images/Wash-Room.png")
}

function setup(){
  database = firebase.database()
  createCanvas(700, 500)
  dog = createSprite(500,250)
  dog.scale = 0.25
  foodObj = new Food()
  foodObj.getFoodStock()
  feedPetButton = createButton("Feed the dog")
  feedPetButton.position(550,95)
  addFoodButton = createButton("Add Food")
  addFoodButton.position(650,95)
  database.ref('FeedTime').on("value",function(data){
    lastFed = data.val()
  })
  database.ref('gameState').on("value",function(data){
    gameState = data.val()
    if (gameState == 'hungry'){
      dog.addImage(feedMeDogImg)
    }
    if (gameState == 'fed'){
      dog.addImage(happyDogImg)
      dog.visible = false
    }
  })
  
  
}

function draw() {  
  if (lastFed !== undefined){
    lastFedHour = lastFed.slice(0,2)
    gardenHour = int(lastFedHour) + 1
    washroomHour = int(lastFedHour) + 2
    if (gardenHour > 12){
      gardenHour -= 12
    }
    if (washroomHour > 12){
      washroomHour -= 12
    }
    hournumber = hour()
    if (hournumber>12){
      hournumber -= 12
    }
    if (hournumber == gardenHour){
      bg = 'garden'
    }
    if (hournumber == washroomHour){
      bg = 'washroom'
    }
    else{
      bg = 'color'
    }
  }
  if (bg == 'garden'){
    background(garden)
  }
  if (bg == 'washroom'){
    background(washroom)
  }
  if (bg == 'color'){
    background(53, 123, 70)
  }

  if(foodObj.foodStock !== undefined && lastFed !== undefined){
    foodObj.display()
    feedPetButton.mousePressed(feedDog)
    addFoodButton.mousePressed(addFood)
    drawSprites()
    fill ("red")
    textSize(18)
    stroke ("blue")
    text("Last Feed: " + lastFed,50,55)
  }
  if (gameState == 'fed'){
    feedPetButton.hide()
    addFoodButton.hide()
  }
  console.log(bg)
}

function addFood(){
  if(foodObj.foodStock !== null){
    foodObj.updateFoodStock(foodObj.foodStock + 1)
  } 
}

function feedDog(){
  gameState = 'fed'
  database.ref('/').update({
    'gameState' : 'fed'
  })
  dog.addImage(happyDogImg)
  foodObj.deductFood()
  foodObj.updateFoodStock(foodObj.foodStock)
  updateFeedTime()
  setTimeout(function(){
    dog.addImage(feedMeDogImg)
    dog.visible = true
    gameState = 'hungry'
    database.ref('/').update({
      'gameState' : 'hungry'
    })
  },14400000)
}

async function updateFeedTime(){
  var response = await fetch('http://worldtimeapi.org/api/timezone/America/Chicago')
  jsonResponse = await response.json()
  hour = jsonResponse.datetime.slice(11,13)
  if(hour > '12'){
    hour = hour % 12
    fedTime = hour + ' PM'
  }
  else if(hour === '00'){
    fedTime = '12 AM'
  }
  else if (hour === '12'){
    fedTime = '12 PM'
  }
  else{
    fedTime = hour + ' AM'
  }
  database.ref('/').update({
    'FeedTime' : fedTime
  }) 


       
}