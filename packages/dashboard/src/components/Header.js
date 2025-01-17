import React, { useContext, memo } from 'react'

const Header = ({preview, setPreview, back, subEditor = null}) => {
  return (
    <div className="editor-heading">
      {subEditor ? <div className="heading-1 back-to" onClick={back} style={{cursor: 'pointer'}}><span>&#8592;</span> Back to Dashboard</div> : <div className="heading-1">Dashboard Editor</div>}
      {!subEditor && <ul className="toggle-bar">
        <li className={preview ? 'inactive' : 'active'} onClick={() => {setPreview(false)}}>Build Layout</li>
        <li className={preview ? 'active' : 'inactive'} onClick={() => {setPreview(true)}}>Preview &amp; Configure</li>
      </ul>}
    </div>
  )
}

export default Header