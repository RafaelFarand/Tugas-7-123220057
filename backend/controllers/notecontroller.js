import Note from '../models/notemodel.js';

// GET
async function getNote(req, res) {
    try {
        const result = await Note.findAll();
        res.status(200).json(result);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// POST
async function createNote(req, res) {
    try {
        const InputResult = req.body;
        const newNote = await Note.create(InputResult);
        res.status(201).json(newNote);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// PUT
async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const updateInput = req.body;
        const note = await Note.findByPk(id);
        if(!note){
            return res.status(404).json({message: 'Note not found'});
        }

        await note.update(updateInput);
        res.status(200).json({message: 'Note updated successfully'});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// DELETE
async function deleteNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findByPk(id);

        if(!note){
            return res.status(404).json({message: 'Note not found'});
        }

        await note.destroy();
        res.status(200).json({message: 'Note deleted successfully'});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export { getNote, createNote, updateNote, deleteNote };