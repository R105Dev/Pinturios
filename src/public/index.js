const init = () => {
    let mouse = {
        click: false,
        move: false,
        pos: { x: 0, y: 0 },
        pos_prev: false
    };

    const canvas = document.querySelector('#drawing');
    const context = canvas.getContext('2d');
    const canvasWidth = 600;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    function getCanvasPosition(canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset
        };
    }

    const socket = io();
    

    let currentColor = 'red'; // Color por defecto

    // Event listeners para cambiar de color
    const colorButtons = document.querySelectorAll('.color-button');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentColor = button.dataset.color; // Asignar el color del dataset del botón
        });
    });

    canvas.addEventListener("mousedown", (event) => {
        mouse.click = true;
    });

    canvas.addEventListener("mouseup", (event) => {
        mouse.click = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        const canvasPos = getCanvasPosition(canvas);
        mouse.pos.x = (event.clientX - canvasPos.left) / canvasWidth;
        mouse.pos.y = (event.clientY - canvasPos.top) / canvasHeight;
        mouse.move = true;
    });

    socket.on('drawLine', data => {
        const { line, color } = data;
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = color; // Usar el color recibido
        context.moveTo(line[0].x * canvasWidth, line[0].y * canvasHeight);
        context.lineTo(line[1].x * canvasWidth, line[1].y * canvasHeight);
        context.stroke();
    });

    function mainLoop() {
        if (mouse.click && mouse.move && mouse.pos_prev) {
            socket.emit('drawLine', { line: [mouse.pos, mouse.pos_prev], color: currentColor });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(mainLoop, 25);
    }

    mainLoop();
};

const socket = io();

function createOrJoinRoom() {
    const roomNumber = document.getElementById('roomNumber').value;
    const nickname = document.getElementById('nickname').value;
    
    socket.emit('createRoom', { roomNumber, nickname });
    
    socket.on('roomParticipants', participants => {
        const roomParticipantsDiv = document.getElementById('roomParticipants');
        roomParticipantsDiv.innerHTML = `<h3>Participantes en Sala ${roomNumber}</h3>`;
        participants.forEach(participant => {
            roomParticipantsDiv.innerHTML += `<p>${participant.nickname}</p>`;
        });
        document.getElementById('roomForm').style.display = 'none';
        document.getElementById('chatBox').style.display = 'flex';
        document.getElementById('currentRoom').textContent = roomNumber;
    });
    
    socket.on('receiveMessage', data => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML += `<p><strong>${data.nickname}:</strong> ${data.message}</p>`;
    });
}

function sendMessage() {
    const roomNumber = document.getElementById('currentRoom').textContent;
    const message = document.getElementById('message').value;
    
    socket.emit('sendMessage', { roomNumber, message });
    
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    document.getElementById('message').value = '';
}

const botonEnviar = document.querySelector("#sendMessage")

botonEnviar.addEventListener("submit", event => {
    event.preventDefault()
    sendMessage()
})

document.addEventListener('DOMContentLoaded', init);
