const express = require("express")
const gsi = require("./modules/gsi")
const path = require("path")

const radar = {
    startRadar: (app, io) => {
        gsi.init(io);
        for (let dir of ["css", "renderers", "img", "maps"]) {
            app.use(`/boltobserv/${dir}`, express.static(path.join(__dirname, dir)))
        }
        app.get("/radar", (req, res) => {
            res.sendFile(path.join(__dirname, "html", "index.html"))
        })
    },
    digestRadar: csogsi => {
        gsi.digest(csogsi);
    }
}

module.exports = radar