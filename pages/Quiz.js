import React from 'react'

export default function Quiz() {
  return (
    <div className="app">
      <div className="home-div">
        <h1 className='question'>Whats the answer to this question that i just asked you</h1>

        <div className='options-container'>
        <p className='options'>Option 1</p>
        <p className='options'>Option 2</p>
        <p className='options'>Option 3</p>
        <p className='options'>Option 4</p>
        </div>

        <div>
          <button className='back-button' onClick={()=> {javascript:history.back()}}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
