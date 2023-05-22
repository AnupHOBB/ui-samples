import * as THREE from 'three'

export class CircularSlider
{
    /**
     * 
     * @param {HTMLDivElement} element html element onto which the slider will be drawn
     */
    constructor(element)
    {
        this._sliderBackground = element
        this._sliderIndicator = document.createElement('div')
        this._sliderIndicator.id = "slider-control"
        this._centre = { x:0, y:0, z:0 }
        this._isMouseDown = false
        this._angle = 0
        this._ogVector =  new THREE.Vector3()
        this._prevPos =  new THREE.Vector3()
        this._min = 0
        this._max = 360
        this._sliderBounds = this._sliderBackground.getBoundingClientRect()
        let x = this._sliderBounds.x + (this._sliderBounds.width/2)
        let y = this._sliderBounds.y
        this._centre.x = x
        this._centre.y = y + (this._sliderBounds.height/2)
        this._ogVector = Misc.subtractVectors({ x: x, y: y, z: 0}, this._centre)
        this._sliderIndicator.onmousedown = () => {this._isMouseDown = true }
        this._ogVector = Misc.subtractVectors({ x: x, y: y, z: 0}, this._centre) 
        document.body.appendChild(this._sliderIndicator)
        setInterval(()=>this._placeCursor(), 10)
    }

    onWindowMouseUp() {this._isMouseDown = false }

    onWindowMouseMove(event)
    {
        if (this._isMouseDown)
        {
            let newVector = Misc.subtractVectors({ x: event.clientX, y: event.clientY, z: 0}, this._centre)
            this._angle = Misc.angleBetwenVectors(this._ogVector, newVector)
            if (event.clientX < this._centre.x)
                this._angle = -this._angle
            this._prevPos.x = event.clientX
            this._prevPos.y = event.clientY
        }
    }

    setMin(min) { this._min = min }

    setMax(max) { this._max = max }

    setValue(value) 
    {
        if (value < this._min || value > this._max)
            this._angle = 0
        else
            this._angle = ((value - this._min)/(this._max -this._min)) * 360 
    }

    getValue()
    {
        let value = (this._angle<0)?360+this._angle:this._angle
        let convertedValue = ((value * (this._max - this._min))/360) + this._min
        return convertedValue
    }

    _placeCursor()
    {
        this._sliderBounds = this._sliderBackground.getBoundingClientRect()
        let newX = this._sliderBounds.x + (this._sliderBounds.width/2)
        let newY = this._sliderBounds.y
        this._centre.x = newX
        this._centre.y = newY + (this._sliderBounds.height/2)
        this._ogVector = Misc.subtractVectors({ x: newX, y: newY, z: 0}, this._centre)
        let rotationVector = new THREE.Vector3(this._ogVector.x, this._ogVector.y, this._ogVector.z)
        rotationVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), Misc.toRadians(this._angle))
        let finalPos = Misc.addVectors(this._centre, rotationVector)
        let indicatorCss = window.getComputedStyle(this._sliderIndicator)
        let indicatorWidth = Misc.pxToNumber(indicatorCss.width)
        let indicatorHeight = Misc.pxToNumber(indicatorCss.height)
        this._sliderIndicator.style = 'position:absolute; top:'+(finalPos.y - (indicatorHeight/2))+'; left:'+(finalPos.x - (indicatorWidth/2))+';'
        this._prevPos = { x: finalPos.x, y: (finalPos.y - 10), z: 0 }
    }
}

const Misc = {
    cosineVectors : function(v1, v2)
    {
        let v1Normalized = this.normalize(v1)
        let v2Normalized = this.normalize(v2)
        return this.dot(v1Normalized, v2Normalized)
    },

    toDegrees : function(radians) { return (radians * 7 * 180)/22 },

    toRadians : function(degrees) { return (degrees * 22) / (7 * 180) },

    angleBetwenVectors : function(v1, v2) { return this.toDegrees(Math.acos(this.cosineVectors(v1, v2))) },

    dot : function(v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z  },

    length : function(v) { return Math.sqrt((v.x * v.x)+(v.y * v.y)+(v.z * v.z)) },

    normalize : function(v)
    {
        let len = this.length(v)
        return { x: v.x/len, y: v.y/len, z: v.z/len}
    },

    addVectors : function(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z } },

    subtractVectors : function(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z } },

    pxToNumber : function(pxValueInString)
    {
        let numberAsChars = [] 
        for (let i=0; i<(pxValueInString.length - 2); i++)
            numberAsChars.push(pxValueInString.charAt(i))
        return Number.parseInt(numberAsChars.join(''))
    }
}


