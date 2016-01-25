var go, gui, positions = [];

var GoControls = function() {
    this.gameSize =  19;
    this.boardSize = 600;
    this.strokeWeight = 2;
    this.lineCount = 30;
    this.solidLineColor = [244, 187, 77];
    this.dottedLineColor = [0, 11, 200];
    this.circleColor = [190, 190, 190];

    this.refresh = drawBoard;

    this.export = function(){
        var svg = document.getElementsByTagName('svg')[0];

        svg = new XMLSerializer().serializeToString(svg);
        var b64 = btoa(unescape(encodeURIComponent(svg)));
        var img = document.createElement('img');
        img.src = "data:image/svg+xml;base64,\n"+b64;
        img.alt = "file.svg";
        var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        window.open(url);

    };

};

window.onload = function() {

    // setup controls
    go = new GoControls();
    gui = new dat.GUI();
    // gui.add(go, 'gameSize', [9, 13, 17, 19]);
    gui.add(go, 'boardSize', 50, 1000);
    gui.add(go, 'lineCount', 5, 100);
    gui.addColor(go, 'solidLineColor');
    gui.addColor(go, 'dottedLineColor');
    gui.addColor(go, 'circleColor');

    gui.add(go, 'refresh');
    gui.add(go, 'export');

    drawBoard();


};




function setup() {
    createCanvas(windowWidth, windowHeight, SVG);
}

function draw() {}

function drawBoard(){

    clear();
    background(255);
    translate(windowWidth/2 - (go.boardSize / 2), windowHeight/2 - (go.boardSize / 2));

    positions = [];
    for(var i = 0; i < go.gameSize; i++){
        for(var j = 0; j < go.gameSize; j++){
            x = go.boardSize / (go.gameSize - 1) * i;
            y = go.boardSize / (go.gameSize - 1) * j;

            // draw main 9 points
            var third = Math.floor(go.gameSize / 3)
            if(i === third && (j === third || j === third * 2 || j === third + Math.floor(third / 2)) ||
                i === third * 2 && (j === third || j === third * 2 || j === third + Math.floor(third/2)) ||
                i === third + Math.floor(third/2) && (j === third || j === third * 2 || j === third + Math.floor(third / 2))){
                fill(150, 150, 150);
                noStroke();
                var mainDotDiam = go.boardSize * 0.015;
                ellipse(x, y, mainDotDiam, mainDotDiam);
            }

            positions.push([x, y]);
        }
    }


    generateRandomCircles();

    noFill();
    strokeWeight(2);
    stroke(color(230, 230, 230));
    rect(0, 0, go.boardSize, go.boardSize);


    // let's gather all the random line positions
    var lineCount = go.lineCount;
    for(var i = 0; i < lineCount; i++){
        var pointCount = Math.round(random(5)) + 3;
        var points = [];
        for(var p = 0; p < pointCount; p++){
            var x, y, rand = Math.floor(random(positions.length - 1));
            x = positions[rand][0];
            y = positions[rand][1];

            if(p > 0){
                if(p % 2 === 0){
                    var lastX = points[p-1].x;
                    // get new x point based on last X
                    var newXPoint = getRandomPointOnAxis(lastX, 'x');
                    x = newXPoint[0];

                    // get new y point based on new X point
                    var newYPoint = getRandomPointOnAxis(newXPoint[1], 'y');
                    y = newYPoint[1];
                }else{
                    var lastY = points[p-1].y;
                    // get new x point based on last X
                    var newYPoint = getRandomPointOnAxis(lastY, 'y');
                    y = newYPoint[1];

                    // get new y point based on new X point
                    var newXPoint = getRandomPointOnAxis(newYPoint[1], 'x');
                    x = newXPoint[0];
                }
            }

            points.push({
                x: x,
                y: y
            });

            // draw circle around end points
            strokeWeight(1);
            var rc = random(50) + 180;
            var c = go.circleColor;
            stroke('rgba(' + Math.round(c[0]) + ', ' + Math.round(c[1]) + ', ' + Math.round(c[2]) + ', ' + random(1) + ')');
            var randDiam = random(50);
            ellipse(x, y, randDiam, randDiam);
        }

        fill(0, 244, 0);
        noStroke(0);

        noFill();
        strokeWeight(1);
        stroke(200, 102, 0);
        strokeJoin(ROUND);

        // let's draw all the lines
        for(p = 0; p < pointCount - 1; p++){
            var start_x = points[p].x;
            var start_y = points[p].y;
            var end_x = points[p+1].x;
            var end_y = points[p+1].y;

            // draw some solid lines
            if(p < pointCount * 0.2){
                strokeWeight(1);
                var slc = go.solidLineColor;

                if(Array.isArray(slc)){
                    stroke('rgba(' + Math.round(slc[0]) + ', ' + Math.round(slc[1]) + ', ' + Math.round(slc[2]) + ', ' + random(1) + ')');
                }else{
                    console.error('dat.gui returned string: ' + slc);
                }
                line(start_x, start_y, end_x, end_y);
                // draw arrow
                arrow(start_x, start_y, end_x, end_y);
            }
            // draw some dotted lines
            else{
                strokeWeight(2);
                var slc = go.dottedLineColor;
                if(Array.isArray(slc)){
                    stroke('rgba(' + Math.round(slc[0]) + ', ' + Math.round(slc[1]) + ', ' + Math.round(slc[2]) + ', ' + random(1) + ')');
                }else{
                    console.error('dat.gui returned string: ' + slc);
                }
                // draw start & end points
                point(start_x, start_y);
                point(end_x, end_y);
                // interpolate
                for(var k = 0; k < 1; k += 0.05){
                    var lerp_x = lerp(start_x, end_x, k);
                    var lerp_y = lerp(start_y, end_y, k);
                    point(lerp_x, lerp_y);
                }
            }
        }
    }

    generateRandomText();

    push();
    beginShape();
    pop();

}

function generateRandomCircles(){
    var count = 14;
    for(var i = 0; i < count; i++){
        var position = positions[Math.floor(random(positions.length - 1))];
        noFill();
        strokeWeight(2);
        stroke(245, 245, 245);
        var randDiam = random(100) + 50;
        ellipse(position[0], position[1], randDiam, randDiam);
    }
}

function generateRandomText(){
    var labels = [
        'activated neurons',
        '1st priority move',
        'Math.pow((G4 -> F2),2)',
        '{b3|c1} >= bm-cm\u2082',
        '2nd priority move',
        'A2 = (-b +- sqrt(b^2-4ac))/(2a)',
        'Ax >= B'
    ];
    for(var i = 0; i < labels.length; i++){
        var position = positions[Math.floor(random(positions.length - 1))];
        var slc = go.dottedLineColor;
        if(Array.isArray(slc)){
            fill('rgba(' + Math.round(slc[0]) + ', ' + Math.round(slc[1]) + ', ' + Math.round(slc[2]) + ', 1)').strokeWeight(0).textSize(10);
        }else{
            console.error('dat.gui returned string: ' + slc);
        }
        textFont('Inconsolata');
        text(labels[i], position[0], position[1]);
    }

}

function getRandomPointOnAxis(position, axis){
    var options = [];
    for(var i = 0; i < positions.length; i++){
        var pos = positions[i];
        if(((axis === 'y') && (pos[1] === position)) ||
            ((axis === 'x') && (pos[0] === position))){
            options.push(pos);
        }
    }
    return options[Math.floor(random(options.length - 1))];
}

function arrow(x1, y1, x2, y2) {

    line(x1, y1, x2, y2);
    push();
    translate(x2, y2);
    a = atan2(x1-x2, y2-y1);
    rotate(a);
    line(0, 0, -10, -10);
    line(0, 0, 10, -10);
    pop();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: Math.round(parseInt(result[1], 16)),
        g: Math.round(parseInt(result[2], 16)),
        b: Math.round(parseInt(result[3], 16))
    } : null;
}