const path= require('path')
const express= require('express')
const http=require('http')
const socketio= require('socket.io')
const Filter=require('bad-words')
const generateMessage= require('./utilis/messages')
const generateURl= require('./utilis/location')
const {addUSer, removeUser, getUser, getUserInRoom }=require('./utilis/user')

const app=express()
const server=http.createServer(app)
const io= socketio(server)

const port= process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../Public')

app.use(express.static(publicDirectoryPath))
let count=0 


io.on('connection',(socket)=>{
    console.log("socket server")
    
    socket.on('join',({username, room}, callback)=>{
        const {error, user} =addUSer({id:socket.id,username, room })
        if(error){
        return  callback(error) }

        socket.join(user.room)
        socket.emit('Message',generateMessage("Welcome! Dear",user.username))
         socket.broadcast.to(user.room).emit('Message', generateMessage(`${user.username} has joined!`,"Admin"))
         io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
         }) 
         callback()
        })

    socket.on('send',(m,callback)=>{
        const user =getUser(socket.id)
        
        
        const filter= new Filter()
         if(filter.isProfane(m)){
                return callback("profanity is not allowed")
          }
        io.to(user.room).emit('Message',generateMessage(m,user.username))
        callback()
        })
socket.on('sendLocation',(m, callback)=>{
    const user=getUser(socket.id)

    io.to(user.room).emit("LocationMessage",generateURl(`http://google.com/maps/?q=${m.lt} ${m.lg}`, user.username))
    callback()
})
socket.on('disconnect',()=>{
   const user= removeUser(socket.id)
    if(user){
        io.to(user.room).emit('Message',generateMessage(`${user.username} has left`,"Admin"))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
         }) 
    }
   

})

   

})

app.use(express.static(publicDirectoryPath))


server.listen(port,()=>{
    console.log('server is running')
})

