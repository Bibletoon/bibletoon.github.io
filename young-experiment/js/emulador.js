var canvas;
var ctx;
var contextWidth;
var contextHeight;
var quazimonochromatic = true
var dragslitsX = false;
var dragslitsY = false;

var wavespeed = {
    radio: 0,
    speed: 2,
    moment: 0
}

var slits = {
    x: 30,
    size: 30,
    minsize: 1,
    maxsize: 60,
    margin: 10,
    length: 0,
    initial: 0,
    num: 2
}

var impactscreen = {
    x: 700,
    width: 50,
    margin: 5
}
var conversion = {
    x: 8, // pixels in millimeter
    xmin: 500,
    y: 300, //pixels in micrometr
    l: 8,
}
var wave = {
    lambda: 480,
    delta: 0,
    min: 200,
    max: 800,   
}

var quazi = {
    deltamin: -10,
    deltamax: 10,
}

var results = 
{
    value: []
}

function sinc(x) 
{
    if (x == 0)
        return 1;
    return Math.sin(x) / x;
}

function drawgraph() 
{
    ctx.strokeStyle = "blue"
    ctx.beginPath()
    let inicio = impactscreen.x + impactscreen.width + impactscreen.margin
    for (var i = 0; i < contextHeight; i++) 
    {
        ctx.lineTo(results.value[i] * (contextWidth - impactscreen.margin - inicio) + inicio, i)
    }

    ctx.stroke()
}

function calculateresults() {
    results.value = []
    if (!quazimonochromatic) {
        let deltad = (2*Math.PI * calculateslitslength(slits.length)) / (wave.lambda / 1000)
        for (var i = 0; i < contextHeight; i++) 
        {
            let position = (((contextHeight / 2 - i) * conversion.y) / 1000)
            let distance = calculatedistance(slits.x) * 1000
            let deltaMd = (deltad * (position / distance))
            let result = (Math.sin(slits.num * deltaMd / 2) / Math.sin(deltaMd / 2))
            if (isNaN(result))
                result = 1
            else
                result /= slits.num
            result = result * result
            results.value.push(result)
        }
    } else 
    {
        for (var dl = quazi.deltamin; dl < quazi.deltamax; dl++) 
        {
            let delta = quazi.deltamax - quazi.deltamin
            console.log(delta)
            let deltad = (2*Math.PI * calculateslitslength(slits.length)) / ((wave.lambda + dl) / 1000)
            for (var i = 0; i < contextHeight; i++) 
            {
                let position = (((contextHeight / 2 - i) * conversion.y) / 1000)
                let distance = calculatedistance(slits.x) * 1000
                let deltaMd = (deltad * (position / distance))
                let result = (Math.sin(slits.num * deltaMd / 2) / Math.sin(deltaMd / 2))
                if (isNaN(result))
                    result = 1
                else
                    result /= slits.num
                result = result * result
                result /= delta
                if (dl == quazi.deltamin)
                    results.value.push(result)
                else 
                    results.value[i]+=result
            }
        }
    }
    
}

function calculatedistance(pixels) {
    return ((((impactscreen.x - slits.margin - pixels) * conversion.x) + conversion.xmin) / 1000).toFixed(2)
}
function calculateslitslength(pixels) {
    return ((pixels * conversion.y) / 1000).toFixed(2)
}
function normalize(e) {
    return {
        x: e.offsetX * canvas.width / canvas.clientWidth | 0,
        y: e.offsetY * canvas.height / canvas.clientHeight | 0
    }
}

function isinslitsX(pos) {
    if (pos.x >= slits.x - 5 && pos.x <= slits.x + slits.size)
        return true
    else return false
}

function isinslitsY(pos) {
    if (slits.num != 1) {
        if ((pos.y >= step && pos.y <= slits.initial + slits.size) || (pos.y >= contextHeight - slits.initial - slits.size && pos.y <= contextHeight - step))
            return true
        else return false
    }
}

function mousemove(e) {
    pos = normalize(e)
    if (pos.x < impactscreen.x) {
        let sliderScreenDistance = document.getElementById("slider-screen-distance")
        let screenDistance = document.getElementById("screen-distance")
        if (isinslitsX(pos) || dragslitsX || dragslitsY) {
            if (isinslitsY(pos) || dragslitsY)
                canvas.style.cursor = "s-resize"
            else
                canvas.style.cursor = "w-resize"
        }
        else canvas.style.cursor = "default"
        if (dragslitsX && pos.x > slits.margin && pos.x < (impactscreen.x - slits.margin)) {
            slits.x = pos.x
            sliderScreenDistance.value = pos.x
            screenDistance.innerHTML = calculatedistance(pos.x)
            calculateresults()
        }
        if (dragslitsY) {
            let sliderslitsdistance = document.getElementById("slider-slits-distance")
            let slitsdistance = document.getElementById("slits-distance")
            if (pos.y > contextHeight / 2 && pos.y < contextHeight - slits.margin && pos.y > contextHeight / 2 + slits.margin)
                slits.initial = contextHeight - pos.y
            if (pos.y < contextHeight / 2 && pos.y > slits.margin && pos.y < contextHeight / 2 - slits.margin)
                slits.initial = pos.y
            slits.length = (contextHeight - slits.num * slits.size - 2 * slits.initial) / (slits.num - 1)
            sliderslitsdistance.value = slits.length
            slitsdistance.innerHTML = calculateslitslength(slits.length)
            calculateresults()
        }
    }
}

function mousedown(e) {
    pos = normalize(e)
    if (isinslitsX(pos)) {
        if (isinslitsY(pos))
            dragslitsY = true
        else
            dragslitsX = true;
    }
}

function mouseup(e) {
    dragslitsX = false;
    dragslitsY = false;
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function drawslits() {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff19ff";
    ctx.beginPath();
    limit = 0;
    for (i = 0; i <= slits.num; i++) {
        ctx.moveTo(slits.x, limit);
        if (i == 0 || i == slits.num)
            step = slits.initial
        else
            step = slits.length
        ctx.lineTo(slits.x, limit + step)
        limit = limit + step + slits.size;
    }
    ctx.stroke();
}

function drawpointslayer() {
    ctx.fillStyle = "rgb(66,66,66)";
    rect(impactscreen.x, 0, impactscreen.width, contextHeight);
}

function drawwaves() 
{
    ctx.globalCompositeOperation = 'destination-over';
    ctx.strokeStyle = "#662f34";
    ctx.lineWidth = 1;
    let radiostep = Math.floor(wave.lambda / conversion.l)
    wavespeed.moment++;
    if (wavespeed.moment == wavespeed.speed) {
        wavespeed.moment = 0
        if (wavespeed.radio >= radiostep)
            wavespeed.radio = 0
        else
            wavespeed.radio++
    }
    let limit = slits.initial
    for (i = 0; i < slits.num; i++) {
        radio = radiostep + wavespeed.radio;
        let varY = limit + Math.round(slits.size / 2)
        while (radio < contextWidth) {
            ctx.beginPath();
            ctx.arc(slits.x, varY, radio, 1.5 * Math.PI, 0.5 * Math.PI);
            ctx.stroke();
            radio += radiostep;
        }
        limit = limit + slits.size + slits.length
    }
    radio = radiostep + wavespeed.radio;
    while (radio < slits.x)
    {
        ctx.beginPath();
        ctx.moveTo(radio, 0);
        ctx.lineTo(radio, contextHeight);
        ctx.stroke()
        radio+=radiostep
    }
    ctx.globalCompositeOperation = 'source-over';
}

function clear() 
{
    ctx.clearRect(0, 0, impactscreen.x, contextHeight);
    ctx.fillStyle = "#FAF7F8";
    rect(impactscreen.x + impactscreen.width, 0, contextWidth, contextHeight);
}

function calculateslits() {
    slits.length = (contextHeight - slits.num * slits.size) / (slits.num + 1)
    slits.initial = slits.length;
}

function init() 
{
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    contextWidth = canvas.width;
    contextHeight = canvas.height;
    calculateslits()
    wave.lambda = wave.min
    calculateresults()
    canvas.addEventListener('mousemove', mousemove)
    canvas.addEventListener('mousedown', mousedown)
    canvas.addEventListener('mouseup', mouseup)
    drawpointslayer();
}

function draw() {
    clear();
    drawslits();
    drawwaves();
    drawgraph();
    requestAnimationFrame(draw)
}

init();
draw();
