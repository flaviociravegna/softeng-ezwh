'use strict';

const express = require('express');
const router = express.Router();
const Position = require('../modules/position_db');
const { check, validationResult, body } = require('express-validator'); // validation middleware
router.use(express.json());


/************** POSITION APIs **************/
/*******************************************/

// Return an array containing all positions.
router.get('/', async (req, res) => {
  try {
    let positions = await Position.getAllPositions();

    const positions_array = positions.map((row) => ({
      positionID: row.positionID,
      aisleID: row.aisle,
      row: row.row,
      col: row.col,
      maxWeight: row.maxWeight,
      maxVolume: row.maxVolume,
      occupiedWeight: row.occupiedWeight,
      occupiedVolume: row.occupiedVolume,
    }));

    res.status(200).json(positions_array);
  }
  catch (err) {
    res.status(500).end();
  }
});

// CREATE NEW POSITION
/// TO DISCUSS: Error 409 not present in API.md
// TODO: migliorare gestione errori
router.post('/', [
  check('positionID').isString().isNumeric().isLength({ min: 12, max: 12 }),
  check('aisleID').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('row').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('col').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('maxWeight').not().isString().isInt({ gt: 0 }),
  check('maxVolume').not().isString().isInt({ gt: 0 })
], async (request, response) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty())
      return response.status(422).json({ errors: errors.array() });

    const posId = request.body.aisleID + request.body.row + request.body.col;
    if (request.body.positionID != posId)
      return response.status(422).json({ error: "Invalid PositionID" });

    const new_position = {
      positionID: request.body.positionID,
      aisle: request.body.aisleID,
      row: request.body.row,
      col: request.body.col,
      maxWeight: request.body.maxWeight,
      maxVolume: request.body.maxVolume,
      occupiedWeight: 0,
      occupiedVolume: 0,
    };

    await Position.createNewPosition(new_position);
    response.status(201).end();
  } catch (err) {
    response.status(503).end();
  }
});

// MODIFY all fields of a position identified by positionID 
router.put('/:positionID', [
  check('positionID').isString().isNumeric().isLength({ min: 12, max: 12 }),
  check('newAisleID').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('newRow').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('newCol').isString().isNumeric().isLength({ min: 4, max: 4 }),
  check('newMaxWeight').not().isString().isInt({ gt: 0 }),
  check('newMaxVolume').not().isString().isInt({ gt: 0 }),
  check('newOccupiedWeight').not().isString().isInt({ gt: -1 }),
  check('newOccupiedVolume').not().isString().isInt({ gt: -1 })
], async (req, res) => {
  try {
    // Check parameters
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    // Check if the position exists
    let position = await Position.getPositionById(req.params.positionID);
    if (position.error)
      return res.status(404).end(); //position not found

    await Position.modifyPosition(req.params.positionID, req.body.newAisleID, req.body.newRow, req.body.newCol,
      req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);

    res.status(200).end();
  } catch (err) {
    res.status(503).send(err);
  }
});

// MODIFY the positionID of a position identified by positionID
router.put('/:positionID/changeID', [
  check('positionID').isString().isNumeric().isLength({ min: 12, max: 12 }),
  check('newPositionID').isString().isNumeric().isLength({ min: 12, max: 12 })
], async (req, res) => {
  try {
    // Check parameter
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).end();

    // Check if the position exists
    let position = await Position.getPositionById(req.params.positionID);
    if (position.error)
      return res.status(404).end(); //position not found

    await Position.modifyPositionID(req.params.positionID, req.body.newPositionID);
    res.status(200).end();
  } catch (err) {
    res.status(503).send(err);
  }
});

// DELETE the position
router.delete('/:positionID', [
  check('positionID').isString().isNumeric().isLength({ min: 12, max: 12 })
], async (request, response) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty())
      return response.status(422).json({ errors: errors.array() });

    // Check if the position exists
    let position = await Position.getPositionById(request.params.positionID);
    if (position.error)
      return response.status(422).end(); //position not found

    let positionOccupied = await Position.searchPosition(request.params.positionID);
    if (positionOccupied.length != 0)
      return response.status(422).json({ error: `Position not empty - impossible to delete` });

    await Position.deletePosition(request.params.positionID);
    response.status(204).end();

  } catch (err) {
    response.status(503).json({ error: `Database error while deleting: ${request.params.positionID}.` });
  }
});


/**********************************************/

module.exports = router;
