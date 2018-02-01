var lastSecond = 0;

function AnalogClock() {
    if(document.getElementById('analogClock').style.display=="none")return;
    var now = new Date();
    var sec = now.getSeconds();
    if(sec == lastSecond)return;
    lastSecond = sec;
    var ctx = document.getElementById('analogClock_canvas').getContext('2d');
    var min = now.getMinutes();
    var hr = now.getHours();
    hr = hr > 12 ? hr - 12 : hr;

    //初始化绘图
    ctx.save();
    ctx.clearRect(0, 0, 400, 400);
    ctx.translate(200, 200);
    ctx.rotate(-Math.PI / 2); //将坐标轴逆时针旋转90度，x轴正方向对准12点方向

    //小时刻度
    ctx.save();
    for (var i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.rotate(Math.PI / 6);
        ctx.moveTo(140, 0);
        ctx.lineTo(120, 0);
        ctx.stroke();
    }
    ctx.restore();

    //时针
    ctx.save();
    ctx.rotate(hr * (Math.PI / 6) + min * (Math.PI / 360) + sec * (Math.PI / 21600));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(108, -4);
    ctx.arc(108, 0, 4, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(-14, 4);
    ctx.arc(-14, 0, 4, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    ctx.restore();

    //分针
    ctx.save();
    ctx.rotate(min * (Math.PI / 30) + sec * (Math.PI / 1800));
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-26, -3);
    ctx.lineTo(128, -3);
    ctx.arc(128, 0, 3, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(-26, 3);
    ctx.arc(-26, 0, 3, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    ctx.restore();

    //秒针
    ctx.save();
    ctx.rotate(sec * (Math.PI / 30));
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.moveTo(-40, -2);
    ctx.lineTo(140, -2);
    ctx.arc(140, 0, 2, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(-40, 2);
    ctx.arc(-40, 0, 2, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    ctx.restore();

    //边框
    ctx.beginPath();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#e9eced';
    ctx.arc(0, 0, 152, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.restore();
}

var analogClockInterval = setInterval(function () {
    AnalogClock()
}, 100);