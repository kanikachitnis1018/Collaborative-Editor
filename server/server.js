const mongoose = require('mongoose')
const Document = require("./Document")

//npm socket.io for server
const http = require('http')
const server = http.createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: 'https://localhost:3000',
        methods: ["GET", "POST"],
    },
}) //client runs on 3000

const defaultValue = " "

server.listen(3000, ()=> {
    console.log("Server running on port 3001");
})

mongoose.connect('mongodb://localhost/collaborative-editor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

io.on("connection", (socket) => {     //socket communicates to the client
    socket.on('get-document', async documentId => {
        const document  = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document', document.data)
    })
    socket.on('send-changes', delta => { 
        socket.broadcast.to(documentId).emit("receive-changes", delta)
        console.log("delta")

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function findOrCreateDocument(id) {
    if(id == null) return 
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({ _id: id, data: defaultValue})
}