module.exports = io => {
    let lineHistory = [];

    io.on('connection', socket => {
        console.log("Nuevo usuario conectado");

        // Enviar el historial de líneas al nuevo cliente
        lineHistory.forEach(item => {
            socket.emit('drawLine', { line: item.line, color: item.color });
        });

        socket.on('drawLine', data => {
            // Agregar la línea al historial con el color
            lineHistory.push({ line: data.line, color: data.color });

            // Emitir la línea con el color a todos los clientes
            io.emit('drawLine', { line: data.line, color: data.color });
        });
    });
};
