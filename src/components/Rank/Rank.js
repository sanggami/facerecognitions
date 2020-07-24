import React from 'react';

const Rank = ({ name, entries }) => {
  return (
    <div>
      <div className='white f3'>
        {`${name}, your current entry count is...`} {/* $ is here to get name dynamically */}
      </div>
      <div className='white f1'>
        {entries} {/*gives the entries number*/}
      </div>
    </div>
  );
}

export default Rank;