'use strict'
var mapH, mapW, map
const bH = 30
const bW = 100
const space = 40
const invRight = 100
const invTop = 50
var talk_height
var c
var blockList = []
var select = null
var mx, my
var slot = [null, null, null]
var size = 0
var lastY
var state = 0
var menuText
const boxColor = ["red", "blue"]

function unclick(e) {
    if (state == 1 && select) {
        let sy = mapH - talk_height
        let i = 0

        for (; i < 3; i++)
            if (select.touch(mapW / 2 - 150 + 150 * i, sy))
                break

        if (i < 3 && i % 2 == ver.includes(select.name)) {
            select.move(mapW / 2 - 150 + 150 * i, sy)

            if (lastY) {
                size--
                blockList.forEach(b => {
                    if (inInv(b) && b.y > lastY) b.move(b.x, b.y - space)
                })
            }

            if (slot[i]) {
                slot[i].move(mapW - invRight, invTop + size * space)
                size++
            }

            slot[i] = select
            action(getString())
        } else {
            if (lastY) select.move(mapW - invRight, lastY)
            else {
                select.move(mapW - invRight, invTop + size * space)
                size++
            }
        }

        select = null
        update()
    }
}

function getBlock(e) {
    for (let i = 0; i < blockList.length; i++) {
        let b = blockList[i]
        if (b.touch(e.offsetX, e.offsetY) && !b.fix)
            return b
    }

    return null
}

function getString() {
    if (!(slot[0] && slot[1] && slot[2]))
        return null

    return slot[0].name + slot[1].name + slot[2].name
}

function inInv(b) {
    return b.x >= mapW - invRight - bW
}

function init() {
    map = $("#map")
    map[0].width = $("body").width(); //document.width is obsolete
    map[0].height = $("body").height(); //document.height is obsolete
    mapH = map[0].height
    mapW = map[0].width
    talk_height = mapH * 4 / 10

    let b = invRight * 2 * 100 / mapW | 0;
    $("#text").css("left", b + "%");
    $("#text").css("width", (100 - b * 2) + "%");

    c = map.get(0).getContext("2d")
    setImg("風月鑒(模糊)")
    menuText = $("#text").html()

    map.mousemove(e => {
        mx = e.offsetX
        my = e.offsetY
        if (select) select.move(mx, my)
        update()
    })

    map.mousedown(e => {
        let b = getBlock(e)

        if (state == 1 && b) {
            select = b
            if (inInv(b)) lastY = b.y
            else {
                lastY = null

                for (let i = 0; i < 3; i++)
                    if (slot[i] == b) slot[i] = null
            }
        }

        if (b && b.name == "開始遊戲") {
            blockList.pop()
            for (let i = 0; i < 3; i++)
                blockList.push(new block(mapW / 2 - 150 + i * 150, mapH - talk_height, "", boxColor[i % 2], true))

            story = JSON.parse(JSON.stringify(oStory))
            action("start")
            state = 1


            update()
        }

        if (b && b.name == "回主畫面") {
            blockList.pop()
            blockList.push(new block(mapW / 2, mapH - talk_height, "開始遊戲", "red"))
            state = 0
            talkCount++
            $("#text").html(menuText)
            setImg("風月鑒(模糊)")

            update()
        }
    })

    map.mouseup(unclick)

    map.mouseleave(unclick)

    blockList.push(new block(mapW / 2, mapH - talk_height, "開始遊戲", "red"))
}

function update() {
    c.clearRect(0, 0, mapW, mapH)

    if (state == 0) {}
    if (state == 1) {}
    for (let i = 0; i < blockList.length; i++) {
        blockList[i].update()
    }
    if (select) select.update()
}

class block {
    constructor(x, y, name, color, fix = false) {
        this.x = x
        this.y = y
        this.name = name
        this.color = color
        this.fix = fix
    }

    update() {
        if (this.fix) {
            c.beginPath();
            c.strokeStyle = this.color;
            c.lineWidth = 3;
            c.rect(this.x - bW / 2 - 1, this.y - bH / 2 - 1, bW + 2, bH + 2)
            c.stroke();
        } else {
            c.fillStyle = this.color
            c.fillRect(this.x - bW / 2, this.y - bH / 2, bW, bH)
        }

        c.fillStyle = "black"
        c.font = "20px Arial";
        c.textAlign = "center";
        c.fillText(this.name, this.x, this.y + 10)
    }

    move(x, y) {
        this.x = x
        this.y = y
    }

    touch(x, y) {
        return x >= this.x - bW / 2 && x <= this.x + bW / 2 && y >= this.y - bH / 2 && y <= this.y + bH / 2
    }
}

function add(name, color) {
    blockList.push(new block(mapW - invRight, invTop + size * space, name, color))
    size++
}

function remove(name) {
    let i = 0
    for (; i < blockList.length; i++) {
        if (blockList[i].name == name) break
    }

    if (i >= blockList.length) return
    let bl = blockList[i]

    if (inInv(bl)) {
        blockList.forEach(b => {
            if (inInv(b) && b.y > bl.y) b.move(b.x, b.y - space)
        })
        size--
    } else {
        for (let i = 0; i < 3; i++)
            if (slot[i] == bl) slot[i] = null
    }

    blockList.splice(i, 1);
}

$(document).ready(() => {
    init()

    update()
})