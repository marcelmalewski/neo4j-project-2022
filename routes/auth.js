const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {});

module.exports = router;
