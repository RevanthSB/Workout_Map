const form = document.querySelector('.textbar-form')
const select = document.querySelector('.form-select')
const cadenceinput = document.querySelector('.cadence-input')
const elevgaininput = document.querySelector('.elevgain-input')
const durationinput = document.querySelector('.duration-input')
const distanceinput = document.querySelector('.distance-input')
const maptextbar = document.querySelector('.map-textbar')
const cadenceElement = document.querySelector('.form-cadence')
const elevgainElement = document.querySelector('.form-elevgain')
const containerworkouts = document.querySelector('.textbar-workouts')
const workoutrc = document.querySelector('.workoutrc')

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];


class Workout {
    
    date = new Date()
    id = Number(Date.now()+Math.floor(Math.random()*9).toString())

    constructor(distance,duration,coords){
        this.distance = distance
        this.duration = duration
        this.coords = coords
    }
    
    

}

class Running extends Workout{

    constructor(distance,duration,coords,cadence,type){
        super(distance,duration,coords)
        this.cadence = cadence
        this.type = type
        this.calcpace()
    }
    calcpace(){
        this.pace = Math.round(this.duration/this.distance)
    }

}

class Cycling extends Workout{

    constructor(distance,duration,coords,elevgain,type){
        super(distance,duration,coords)
        this.elevgain = elevgain
        this.type = type
        this.calcspeed()
    }
    calcspeed(){
        this.speed = Math.round(this.distance/(this.duration/60))
    }

}



class App{
     #mapevent
     #map
     #mapzoomlvl = 13
     #workouts = []

    constructor(){
        this._getposition()
        this._submitform()
        this._toggleelevationfield()
        this._getlocalstorage()
        containerworkouts.addEventListener('click',this._movemap.bind(this))
    }
    _getlocalstorage(){
        const localdata = JSON.parse(localStorage.getItem('workout'))
        if(!localdata) return
        this.#workouts = localdata
    }
    
    _renderlocalstoragedata(){
        if(!this.#workouts) return
        this.#workouts.forEach(work => {
            this._renderworkoutonmap(work)
        });
    }

    _getposition(){
        let error = function(){
            alert('Unable to get position')
        }
        navigator.geolocation.getCurrentPosition(this._loadmap.bind(this),error)
        
    }
    _loadmap(position){

    form.style.display = 'none'

    const { latitude }=position.coords
    const { longitude }=position.coords
    const coords = [latitude,longitude]


    this.#map = L.map('map').setView(coords,this.#mapzoomlvl);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.#map);
    
     
    this._renderlocalstoragedata()

    this.#map.on('click',this._showform.bind(this))  
    
    

    }
    _showform(mp){
        this.#mapevent = mp
        form.style.display = 'grid'
        setTimeout(()=>{form.classList.remove('hidden')},100)
    }
    _submitform(){
        form.addEventListener('submit',this._newworkout.bind(this))
    }
    _toggleelevationfield(){
        select.addEventListener('change',function(){
            cadenceElement.classList.toggle('c-hidden')
            elevgainElement.classList.toggle('c-hidden')
     })
    }
    _newworkout(e){
        const validinput = function(...inputs) {return inputs.every(inp => Number.isFinite(inp))} 
        const validnumber = function(...inputs) {return inputs.every(inp => inp>0)}
        
        e.preventDefault()
       
        
        const type = select.value
        const distance = +distanceinput.value
        const duration = +durationinput.value
        const{lat,lng} = this.#mapevent.latlng
        let workout


        if (type === 'Running'){
            const cadence = +cadenceinput.value
            if(!validinput(distance,duration,cadence) || !validnumber(distance,duration,cadence)) 
            return alert('Input should be a positive number')
            workout = new Running(distance,duration,[lat,lng],cadence,type)
        }
        else{
            const elevgain = +elevgaininput.value
            if(!validinput(distance,duration,elevgain) || !validnumber(distance,duration,elevgain)) 
            return alert('Input should be a positive number')
            workout = new Cycling(distance,duration,[lat,lng],elevgain,type)
        }
       this.#workouts.push(workout)

       this._renderworkoutonmap(workout)
    
       this._hideform()

       this._setlocalstorage()
        
    }
    _hideform(){
        distanceinput.value = durationinput.value = cadenceinput.value = elevgaininput.value = ' '
        form.classList.add('hidden')
        form.style.display = 'none'
        distanceinput.focus()
    }
    _renderworkoutonmap(workout){
        const date = new Date()
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth:300,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className: `${workout.type}-popup`,
        })).setPopupContent(`${workout.type === 'Running'?'🏃‍♂️':'🚴‍♀️'} ${workout.type} on ${months[date.getMonth()]} ${date.getDate()}`).openPopup();

        this._renderworkoutontextbar(workout)
    }

    _renderworkoutontextbar(workout){
        const date = new Date()
        const html = `<li class="textbar-${workout.type} workoutrc" data-id="${Number (workout.id)}">
        <p class="${workout.type}-label">${workout.type} on ${months[date.getMonth()]} ${date.getDate()}</p>
        <div class="${workout.type}-metric">
            <p class="">
                <span class="${workout.type}-icon1">${workout.type === 'Running'?'🏃‍♂️':'🚴‍♀️'}</span>
                <span class="${workout.type}-dis">${workout.distance}</span>
                <span>KM</span>
            </p>
            <p>⏱
                <span class="${workout.type}-dur">${workout.duration}</span> 
                MIN</p>
            <p>⚡️
               <span class="${workout.type}-${workout.type === 'Running'?'cad':'elev'}">${workout.type === 'Running'?workout.cadence:workout.elevgain}</span>  
               <span>${workout.type === 'Running'?'MIN/KM':'KM/H'}</span></p>
            <p>
                <span class="${workout.type}-icon2">${workout.type === 'Running'?'🦶🏼':'⛰'}</span>
                <span class="${workout.type}-${workout.type === 'Running'?'pace':'speed'}">${workout.type === 'Running'?workout.pace:workout.speed}</span>
                <span>SPM</span>
            </p>
        </div>
        </li>`
              form.insertAdjacentHTML("afterend",html)
    }
    _movemap(e){
       const workoutel =  e.target.closest('.workoutrc')
       if(!workoutel) return
       const workout = this.#workouts.find(work => work.id == workoutel.dataset.id)
       this.#map.setView(workout.coords,this.#mapzoomlvl,{
        animate : true,
        duration : 2,
        easeLinearity : 0.50,
        noMoveStart: true,
       })
    }

    _setlocalstorage(){
        localStorage.setItem('workout',JSON.stringify(this.#workouts))
    }

    reset(){
        localStorage.removeItem('workout')
        location.reload()
    }
}

let app = new App()


