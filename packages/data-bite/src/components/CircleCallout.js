import React, { useState, useEffect, memo, useContext } from 'react'
import themes from '@cdc/core/data/themes';
import chroma from 'chroma-js';

const CircleCallout = ({text, theme = 'theme-blue', dataFormat, biteFontSize}) => {
  const styles = {
    outerRing: {
      fill: themes[theme].primary
    },
    innerRing: {
      fill: chroma(themes[theme].primary).darken(0.5)
    },
    text: {
      fill: '#FFF'
    }
  }

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="circle-callout callout">
      <circle cx="50" cy="50" r="45" style={styles.innerRing} strokeWidth="10" stroke={styles.outerRing.fill} />
      <text y="50%" x="50%" fontSize={biteFontSize} style={styles.text} textAnchor="middle" dominantBaseline="central">{dataFormat.prefix + text + dataFormat.suffix}</text>
    </svg>
  )
}

export default CircleCallout
