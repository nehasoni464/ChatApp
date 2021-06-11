// const { Socket } = require("socket.io")

const result = io()

const $messageForm = document.querySelector("#msgForm")
const $buttonForm = document.querySelector('button')
const $inputForm = document.querySelector('input')
const $buttonLocation = document.querySelector('#sendLocation')
const $messageI = document.querySelector('#messageI')
const $location = document.querySelector('#location')

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll=()=>{
    //new message element
    const $newMessage=$messageI.lastElementChild
    //height of th last new message
    const newMessageStyles= getComputedStyle($newMessage)
    const margin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight+margin
    //visible height
    const visibleHeight=$messageI.offsetHeight
    //height of messages containe
    const containerHeight= $messageI.scrollHeight
    //how far have I scrolled?
    const scrolloffset= $messageI.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<= scrolloffset){
        $messageI.scrollTop= $messageI.scrollHeight
    }

}
result.on('Message', (msg) => {
    console.log("msd", msg)


    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        username: msg.username,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messageI.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

result.on("LocationMessage", (urlM) => {

    const html = Mustache.render(locationTemplate, {
        username: urlM.Username,
        url: urlM.url,
        createdAt: moment(urlM.createdAt).format('h:mm a')
    })
    $messageI.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

result.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
document.querySelector("#sidebar").innerHTML=html
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $buttonForm.setAttribute('disabled', 'disabled')
    const messaage = e.target.elements.msg.value
    //const user=e.target.elements.user.value
    // document.querySelector('input').value


    result.emit('send', messaage, (error) => {
        $buttonForm.removeAttribute('disabled')
        $inputForm.value = ''
        $inputForm.focus()
        if (error) {
            return console.log(error)
        }
        console.log("your message has been sent")
    })
})

$buttonLocation.addEventListener('click', (e) => {
    e.preventDefault()

    if (!navigator.geolocation) {
        return ('alert', "Cannot able to fetch the location ")
    } $buttonLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const lt = position.coords.latitude
        const lg = position.coords.longitude
        result.emit('sendLocation', { lt, lg }, () => {
            console.log("location has been shared")
            $buttonLocation.removeAttribute('disabled')
        })

    })

})
result.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})