const canvas = document.getElementById('canvas1');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const cw = canvas.width;
const ch = canvas.height;
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('curr-score');
const startBtn = document.getElementById('btn');
const uiWin = document.getElementById('ui-window-container');
const scoreCtr = document.getElementById('final-score');

class Player {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
}
class Projectile {
    constructor(x, y, velocity, radius, color){
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
class Enemy {
    constructor(x, y, velocity, radius, color){
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
// class Particle {
//     constructor(x, y, velocity, radius, color){
//         this.x = x;
//         this.y = y;
//         this.velocity = velocity;
//         this.radius = radius;
//         this.color = color;
//         this.alpha = 1;
//     }
//     draw(){
//         ctx.save();
//         ctx.globalAlpha = this.alpha;
//         ctx.beginPath();
//         ctx.fillStyle = this.color;
//         ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
//         ctx.fill();
//         ctx.restore();
//     }
//     update(){
//         this.draw();
//         this.x += this.velocity.x;
//         this.y += this.velocity.y;
//         this.alpha -= 0.01;
//     }
// }
const player1 = new Player(cw /2, ch / 2, 30, 'dodgerblue');
let enemyArr = [];
// let paritcleArr = [];
let projectileArr = [];

// function to initialize every array and the window UI
function init(){
    projectileArr = [];
    enemyArr = [];
    // paritcleArr = [];
    scoreElement.innerHTML = 0;
}

function spawnEnemy(){

    // spawn an enemy every 1000 milliseconds
    setInterval(() => {
        const radius = Math.random() * 20 + 8;
        let x;
        let y;
        if(Math.random() <= 0.5){
            x = Math.random() <= 0.5 ? 0 - radius : cw + radius;
            y = Math.random() * ch;
        } else {
            x = Math.random() * cw;
            y = Math.random() <= 0.5 ? 0 - radius : ch + radius;
        }
        const angle = Math.atan2(ch / 2 - y, cw / 2 - x);   // calculate the angle between the spawned enemy and the player
        const velocity = { 
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        const color = 'hsl(' + Math.random() * 360 + ', 50%, 50%)';
        enemyArr.push(new Enemy(x, y, velocity, radius, color));
    },1000);
}

let score = 0;
function animate(){
    let animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';   // alpha = 0.1 results in fading trails
    ctx.fillRect(0, 0, cw, ch);     // clear the canvas window with black color in each animation frame
    player1.draw();

    // paritcleArr.forEach((particle, particleIndex) => {
    //     if(particle.alpha <= 0){
    //         paritcleArr.splice(particle, 1);
    //     } else {
    //         particle.update();
    //     }
    // });

    projectileArr.forEach((projectile, projectileIndex) => {
        projectile.update();

        // if condition to remove out of screen projectiles from projectile array
        if(projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > cw ||
            projectile.y + projectile.radius < 0 || 
            projectile.h - projectile.radius > ch){
            setTimeout(() => {
                projectileArr.splice(projectileIndex, 1);
            },0);
        }
    });

    // looping through each enemy
    enemyArr.forEach((enemy, enemyIndex) => {
        enemy.update();
        const dist = Math.hypot(player1.x - enemy.x, player1.y - enemy.y);  // calculate the distance between the player and the current enemy

        // when enemy hits player
        if(dist - player1.radius - enemy.radius < 1){
            cancelAnimationFrame(animationId);
            uiWin.style.display = 'flex';
            scoreCtr.innerHTML = score;
        }

        // looping through each projectile
        projectileArr.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);    // calculate distance between current enemy and current projectile
            
            // when projectile touches enemy
            if( dist - projectile.radius - enemy.radius < 1){
                score += 100;
                scoreElement.innerHTML = score;

                // for(let i=0; i<enemy.radius; i++){
                //     paritcleArr.push(new Particle(projectile.x, projectile.y, {
                //         x: (Math.random() - 0.5) * (Math.random() * 6),
                //         y: (Math.random() - 0.5) * (Math.random() * 6)
                //     }, Math.random() * 3, enemy.color));
                // }
                
                // if enemy is of large radius shrink it after projectile hits it else remove the enemy from the enemy array
                if(enemy.radius - 10 > 10){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectileArr.splice(projectileIndex, 1);
                    },0);
                } else {
                    setTimeout(() => {
                        enemyArr.splice(enemyIndex, 1);
                        projectileArr.splice(projectileIndex, 1);        
                    })
                }
            }
        })
    });
}
window.addEventListener('click',function(event){
    const angle = Math.atan2(event.y - ch / 2, event.x - cw / 2);   // calculate the direction in which projectile will travel
    const velocity = { 
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }
    projectileArr.push(new Projectile(cw / 2, ch / 2,
        velocity, 5, 'white'));
});
startBtn.addEventListener('click',() => {
    init();
    animate();
    spawnEnemy();
    uiWin.style.display = 'none';
});

