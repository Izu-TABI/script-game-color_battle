const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.querySelector('#js-scoreElement');
const scoreBigElement = document.querySelector('#js-scoreBigElement');
const gameBtn = document.querySelector('#js-startGameBtn');
const modalElement = document.querySelector('#js-modalElement');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, color) {
        this.score = 0;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {//描画
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {//それぞれを更新
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;  
        
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {//描画
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {//それぞれを更新
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;


    }
}

const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {//描画
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {//それぞれを更新
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;

    }
}


const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];


function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];    
    score = 0;    
    scoreElement.innerHTML = score;
    scoreBigElement.innerHTML = score;
}


function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;

        if(Math.random() > .5) {
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
            // y = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        }else {
            x = Math.random() * canvas.width;
            y = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%`;

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));  
        console.log(enemies.length);

    },1000);
}

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update(); 
        }


    })

    projectiles.forEach((projectile, index) => {
        projectile.update();


        if(projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
         
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }

    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 1) {//プレイヤーと敵の当たり判定
            modalElement.style.display = 'block';
            cancelAnimationFrame(animationId);
        } 


        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);//弾と敵との距離を計算

            if(dist - enemy.radius - projectile.radius < 1) {//弾と敵の当たり判定

                for(let i = 0; i < 20; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)} 
                        ));
                }
                if(enemy.radius - 10 > 5){

                    player.score += 100;
                    document.getElementById("js-scoreElement").innerHTML = `${player.score}`;
    
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                } else {

                    player.score += 250;
                    scoreElement.innerHTML = `${player.score}`;
                    scoreBigElement.innerHTML = `${player.score}`;

                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0)

                }

            }
        });
    });
}
window.addEventListener('click', (event) => {

    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle)* 4
    }

    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        {x: velocity.x, y: velocity.y}
    ));

});

gameBtn.addEventListener('click', (event) => {
    init();
    animate();
    modalElement.style.display = 'none';
    
});

spawnEnemies(); 