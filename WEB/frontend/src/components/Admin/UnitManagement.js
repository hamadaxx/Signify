import React, { useState } from 'react';
import { db } from '../firebase'; // Adjust the import based on your Firebase setup
import { collection, addDoc } from 'firebase/firestore';

const UnitManagement = () => {
  const [unitTitle, setUnitTitle] = useState('');
  const [unitOrder, setUnitOrder] = useState('');
  const [imagePath, setImagePath] = useState('');
  
  const handleAddUnit = async () => {
    try {
      const newUnit = {
        title: unitTitle,
        unitOrder,
        imagePath,
      };

      const unitRef = await addDoc(collection(db, 'units'), newUnit);
      console.log('Unit added with ID:', unitRef.id);
    } catch (e) {
      console.error('Error adding unit: ', e);
    }
  };

  return (
    <div>
      <h1>Manage Units</h1>
      <input
        type="text"
        value={unitTitle}
        onChange={(e) => setUnitTitle(e.target.value)}
        placeholder="Unit Title"
      />
      <input
        type="text"
        value={unitOrder}
        onChange={(e) => setUnitOrder(e.target.value)}
        placeholder="Unit Order"
      />
      <input
        type="text"
        value={imagePath}
        onChange={(e) => setImagePath(e.target.value)}
        placeholder="Image Path"
      />
      <button onClick={handleAddUnit}>Add Unit</button>
    </div>
  );
};

export default UnitManagement;
