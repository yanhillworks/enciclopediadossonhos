let crossX, crossY;
let previousText = "Previous text";
let blinkTimer = 0;
let blinkDuration = 5;
let crossTextList = [];
let currentLabelIndex = 0;
let uniqueLabelValues = [];
let maxText = 0;
let tweetTexts = [];
let tweetLabel = [];
let selectedLabel;
let updateInterval;
let barWidth;
let updateDuration = 20 * 1000;
let points = [];
let spacing;
let elapsedTime;
let colorSchemes = [];
let selectedColorScheme;
let posy=10;

let currentIndex = 0

/// Graph variables
var nodes = [];
var nodeCon = [];
var lerpValue = 0.2;
var startDisMultiplier = 0.1;
var closeNode;
var closeNodeMag;

var gravityConstant = 2.1;
var forceConstant; // Distancia entre as labels
var physics = true;

rectSize = 250;
/// Finish graph variables


///// Only full_label
tweetLabel
let fullMainLabel = new Set();
/////
function preload() {
  table = loadTable("dataset_pred_labeled_21703_objects.csv","csv","header");
  customFont = loadFont("Karla/static/Karla-Regular.ttf");
  dataTable = loadTable("idList.csv", "csv", "header");
  dataLabels = loadTable("connectionList.csv", "csv", "header");
}
function draw() {
 
  fill(0)
  rect(rectSize*2,0,width-300,1000)
  drawLine();
  drawNextCrossAndText2();
  drawNextCrossAndText2_Panel();
  drawNodesGraph();   // Graph functions
  drawLabelPanel()
}

function setup() {
  colorSchemes = [
    {
      background: color(0),
      labelColor: color(255, 255, 255),
      labelRectColor: color(107, 0, 0),
      postTextColor: color(0),
      rectStoke: color(0),
      rectFill: color(255, 255, 255),
      lineTwoColor: color(80),
    },
    {
      background: color(0),
      labelColor: color(255),
      labelRectColor: color(139, 42, 215),
      postTextColor: color(0),
      rectStoke: color(0),
      rectFill: color(255, 255, 255),
      lineTwoColor: color(80),
    },
  ];

  selectedColorScheme = random(colorSchemes);
  createCanvasAndData();
  setInterval(saveCrossAndText, 5);
  setupGraph()
}

function updateSketchAndBar() { // Faz a barra de tempo andar
  updateSketch();
  setupGraph()
}

function createCanvasAndData() { // Crio canvas e defino suas dimensões.
  let canvasWidth = windowWidth;
  let canvasHeight = 800;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvasp");
  let labelYColumn = table.getColumn("label1");
  uniqueLabelValues = Array.from(new Set(labelYColumn));
  uniqueLabelValues = Array.from(new Set(labelYColumn)).sort();
  selectedLabel = uniqueLabelValues[currentIndex];
  getAllTweetTexts();
}

function updateSketch() {
  crossTextList = [];
  maxText = 0;
  tweetTexts = [];
  tweetLabel = [];
  fullMainLabel = new Set();
  points = [];
  selectedColorScheme = random(colorSchemes);
  getAllTweetTexts();
}



function getAllTweetTexts() {
  selectedLabel =uniqueLabelValues[currentIndex];

  for (let i = 0; i < table.getRowCount(); i++) {
    if (table.getString(i, "label1") === selectedLabel) {
      tweetTexts.push(table.getString(i, "index"));
      tweetLabel.push(table.getString(i, "label1_full") + ' ' + table.getString(i, "label2_full") + ' ' + table.getString(i, "label3_full"));
      fullMainLabel.add(table.getString(i, "label1_full"));
    }
  }
}

function saveCrossAndText() {
  if (maxText < tweetTexts.length) {
    let crossX = random(width);
    let crossY = random(10, height - 100);
    let selectedTweetText = tweetTexts[maxText];
    let selectedLabelText = tweetLabel[maxText];
    let speed = 0;

    crossTextList.push({
      x: crossX,
      y: crossY,
      previousText: previousText,
      postText: selectedTweetText,
      label: selectedLabelText,
      blinked: false,
      speed: speed,
    });
    blinkTimer = 0;
    maxText++;
  }
  invertSpeed(crossTextList);
}

function drawBlinkingCrossAndText(x, y, postText, index, label) {
  if (blinkTimer < blinkDuration) {
    blinkTimer++;
  } else {
    crossTextList[index].blinked = true;
  }
}

function drawNextCrossAndText2() {
  for (let index = 0; index < crossTextList.length; index++) {
    let crossData = crossTextList[index];
    if (crossData.blinked) {
      drawPostText(
        crossData.x,
        crossData.y,
        crossData.postText,
        crossData.label
      );
      crossData.x += crossData.speed;

      if (crossData.x > width) {
        crossData.x = 0;
      }
    }
  }
}

function drawPostText(x, y, postText, label) {
  padding = 20;
  let textHeight =
    (textAscent() + textDescent()) * ceil(textWidth(postText) / 200);
  textFont(customFont);
  textSize(12);
  textAlign(LEFT, TOP);

  fill(selectedColorScheme.labelRectColor);
  noStroke();
  rect(x, y, textWidth(label) + 10, 15);

  fill(selectedColorScheme.rectFill);
  stroke(selectedColorScheme.rectStoke);
  rect(x, y + 15, 300+padding, textHeight+padding);

  noStroke();
  fill(selectedColorScheme.labelColor);
  text(label, x + 5, y );

  fill(selectedColorScheme.postTextColor);
  text(postText, x + padding, y + padding, 250);
}

////////////////////////////////////////////////////////////// PANEL STUFF //////////////////////////////////////////////////////////////

function drawNextCrossAndText2_Panel() {
  posy = 0;
  for (let index = 0; index < crossTextList.length; index++) {
    let crossData = crossTextList[index];
    posy=posy+15;

    if (!crossData.blinked) {
      drawBlinkingCrossAndText(
        crossData.x,
        crossData.y,
        crossData.postText,
        index,
        crossData.label,
      );
    }
  }
}
////////////////////////////////////////////////////////////// LINE STUFF //////////////////////////////////////////////////////////////

function drawLine() {
  for (let index = 1; index < crossTextList.length; index++) {
    if (isNaN(crossTextList[index].x)) {
      crossTextList[index].x = 0;
    }
    noFill();
    strokeWeight(1);
    stroke(selectedColorScheme.lineTwoColor);
    if (index > 1) {
      let x1 = crossTextList[index - 2].x;
      let y1 = crossTextList[index - 2].y;
      let x2 = crossTextList[index - 1].x;
      let y2 = crossTextList[index - 1].y;
      let x3 = crossTextList[index].x;
      let y3 = crossTextList[index].y;
      let x4 = (x1 + x2) / 2;
      let y4 = (y1 + y2) / 2;
      let x5 = (x2 + x3) / 2;
      let y5 = (y2 + y3) / 2;
      bezier(x1, y1, x4, y4, x5, y5, x3, y3);
    }
  }
}

////////////////////////////////////////////////////////////// INVERT OBJECTS SPEED //////////////////////////////////////////////////////////////

function invertSpeed(crossTextList) {
  // Find the maximum and minimum text widths across all objects
  let maxWidth = -Infinity;
  let minWidth = Infinity;
  crossTextList.forEach((item) => {
    let textWidthValue = textWidth(item.postText);
    maxWidth = max(maxWidth, textWidthValue);
    minWidth = min(minWidth, textWidthValue);
  });

  crossTextList.forEach((item) => {
    let textWidthValue = textWidth(item.postText);
    let itemWidthRatio = map(textWidthValue, minWidth, maxWidth, 0, 1);
    let invertedSpeed = map(itemWidthRatio, 0, 1, 0.5, 0.1);
    item.speed = invertedSpeed;
  });
}

////////////////////////////////////////////////////////////// GRAPH //////////////////////////////////////////////////////////////

function setupGraph(){
  nodes = [];
  nodeCon = [];
  forceConstant = ((1000000) / (7000)) * (20 - 3);

  dataFromTo = convertDataTableToArray(dataLabels);
  dataIds = convertDataTableToDataLabels(dataTable);

  // Filter data
  dataFromTo = dataFromTo.filter(item => item.label1 === selectedLabel);
  dataIds = dataIds.filter(item => item.label1 === selectedLabel);
  

  // Determine the number of nodes based on the data array
  var nodeIndices = new Set();

  dataFromTo.forEach(connection => {
    nodeIndices.add(connection.from);
    nodeIndices.add(connection.to);
  });
  noNodes = nodeIndices.size;

  // Initialize nodes with random positions, sizes, and labels
  for (let i = 0; i < noNodes; i++) {
    let x = random(-startDisMultiplier * width, startDisMultiplier * width);
    let y = random(-startDisMultiplier * height, startDisMultiplier * height);
    let id = dataIds[i].id; // Get the label data from dataLabels
    let label = dataIds[i].label; // Get the label
    let mass =dataIds[i].value; // Get the value to use as mass
    node = new Node(createVector(x, y), mass, label, id);
    nodes.push(node);
   // print(nodes)
  }
  
  closeNode = nodes[0];

  // Initialize connections based on the data array
  dataFromTo.forEach(connection => {
    nodeCon.push([connection.from, connection.to, 100]); // 100 is the max distance used for simplicity
  });

}
//// HERE IS THE DRAW OF GRAPH 

function drawNodesGraph(){
  push();
  translate(rectSize, height/2.5);
  rectMode(RADIUS)
  fill(0)
  stroke(0)
  rect(0,0,rectSize,1000)


  nodeCon.forEach(con => { // para cada connection
    node1 = nodes.find(node => node.id === con[0]); // Find node by id for con[0]
    node2 = nodes.find(node => node.id === con[1]); // Find node by id for con[1]
    //stroke(150)
    strokeWeight(1)
    stroke(selectedColorScheme.lineTwoColor);
    line(node1.pos.x, node1.pos.y, node2.pos.x, node2.pos.y); //
  });

  applyForces(nodes);

  nodes.forEach(node => {
    node.draw();
    if (physics) {
      node.update();
    }
  });
  pop()
}

function applyForces(nodes) {
  // Apply force towards center
  nodes.forEach(node => {
    gravity = node.pos.copy().mult(-1).mult(gravityConstant);
    node.force = gravity;
  });

  // Apply repulsive force between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pos = nodes[i].pos;
      dir = nodes[j].pos.copy().sub(pos);
      force = dir.div(dir.mag() * dir.mag());
      force.mult(forceConstant);
      nodes[i].force.add(force.copy().mult(-1));
      nodes[j].force.add(force);
    }
  }

  // Apply forces applied by connections
  nodeCon.forEach(con => {
    if(con[0] == con[2]){
    let node1 = nodes.find(node => node.id === con[0]); // Find node by id for con[0]
    let node2 = nodes.find(node => node.id === con[1]); // Find node by id for con[1]
    let maxDis = con[2];
    let dis = node1.pos.copy().sub(node2.pos);
    diff = dis.mag() - maxDis;
    node1.force.sub(dis);
    node2.force.add(dis);
    }
  });
}

function Node(pos, mass, label, id) {
  this.pos = pos;
  this.force = createVector(0, 0);
  this.mass = (2 * PI * mass)/1.5; // Assign the mass directly
  this.label = label; // Assign the label
  this.id = id; // Assign the label
  this.fs = [];
}

Node.prototype.update = function() {
  force = this.force.copy();
  vel = force.copy().div(this.mass);
  this.pos.add(vel);
}

Node.prototype.draw = function() {
  //rect graph
  fill(selectedColorScheme.rectFill);
  noStroke();
  rectMode(RADIUS);
  fill(selectedColorScheme.labelRectColor)
  rect(this.pos.x, this.pos.y, 3, 3);

  const masses = nodes.map(node => node.mass);
  const minMass = Math.min(...masses);
  const maxMass = Math.max(...masses);
  maxRange = 24;
  minRange = 12;

  const massMapped = ((this.mass - minMass) / (maxMass - minMass)) * (maxRange - minRange) + minRange;

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(massMapped);
  text(this.label, this.pos.x, this.pos.y); // Use the label for display
  stroke(0);
}

function convertDataTableToArray(dataTable) {
  let fromIndex = dataTable.getColumn('from');
  let label1 = dataTable.getColumn('label1');
  let toIndex = dataTable.getColumn('to');
  let resultArray = [];

  for (let i = 0; i < fromIndex.length; i++) {
    resultArray.push({label1: label1[i], from: int(fromIndex[i]), to: int(toIndex[i]) });
  }

  return resultArray;
}

function convertDataTableToDataLabels(dataTable) {
  let idColumn = dataTable.getColumn("id");
  let label1 = dataTable.getColumn("label1")
  let labelColumn = dataTable.getColumn("label");
  let valueColumn = dataTable.getColumn("value");
  let resultArray2 = [];

  for (let i = 0; i < idColumn.length; i++) {
    resultArray2.push({
      label1: label1[i],
      id: int(idColumn[i]),
      label: labelColumn[i],  // Use the index to get the corresponding label
      value: int(valueColumn[i]) // Use the index to get the corresponding value
    });
  }

  return resultArray2;
}

//////////////////////////////////////////////////////////////////// PANEL //////////////////////////////////////////////////////////////////

function drawLabelPanel(){
  textSize(14);
  noStroke()
  drawInstructions()

  translate(25,30)
 
  drawRadical()
  drawWords()
}

function drawInstructions(){
  push()
  
  translate(25,0)
  fill(255)                
  rect(0,0,textWidth(" Instruções: Pressione > ou < (seta esquerda e direita do teclado) para navegar entre os grupos. "),16)
  fill(0)
  text(" Instruções: Pressione > ou < (seta esquerda e direita do teclado) para navegar entre os grupos.",0,0)
  pop()
}

function drawRadical(){

  let textPrefix = tweetTexts.length + " Sonhos com Radical  "
  fill(255)
  fill(selectedColorScheme.labelRectColor);
  rect(textWidth(textPrefix),0,textWidth(selectedLabel),16)
  fill(255)
  text(textPrefix,0,0)
  fill(selectedColorScheme.labelColor);
  text(selectedLabel,textWidth(textPrefix),0)
}

function drawWords(){
  var spaceX = 0;
  var spaceY = 0;

  translate(0,40)
  fill(255)
  text("Palavras incluídas",0,-20)
  for(let value of fullMainLabel){
    fill(selectedColorScheme.labelRectColor);
    rect(spaceX + textWidth("Palavras incluídas  "),spaceY-20,textWidth(value),16)
    fill(selectedColorScheme.labelColor);
    text(value,spaceX + textWidth("Palavras incluídas  "),spaceY-20)
    spaceX+=(textWidth(value)+5);
    if(spaceX >= 200){
      spaceY+=20;
      spaceX = 0;
    }
  }
}

//////////////////////////////////////////////////////////////////// KEY PRESSED //////////////////////////////////////////////////////////////////

function keyPressed(){
  
  if (keyCode === RIGHT_ARROW) {
    if(currentIndex == uniqueLabelValues.length-1){
      currentIndex = 0
      updateSketchAndBar();
    }
    else{
      currentIndex++
      updateSketchAndBar();
    }
  }

  if (keyCode === LEFT_ARROW){
    if(currentIndex == 0){
      currentIndex = uniqueLabelValues.length-1
    updateSketchAndBar()
    }
    else{
      currentIndex--;
      updateSketchAndBar()
    }

  }
}