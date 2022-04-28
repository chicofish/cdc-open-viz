import { useState, useEffect, useContext } from 'react'
import Context from './../context.tsx';
import chroma from 'chroma-js';

const useLollipopChart = () => {
	
	const { config, updateConfig } = useContext(Context)
	const lollipopBarWidth = config.lollipopSize === 'large' ? 7 : config.lollipopSize === 'medium' ? 6 : 5;
	const lollipopShapeSize = config.lollipopSize === 'large' ? 14 : config.lollipopSize === 'medium' ? 12 : 10;
	const handleBarColor = (barColor) => {
		return (
			config.isLollipopChart && config.lollipopColorStyle === 'regular' ? barColor :
			config.isLollipopChart && config.lollipopColorStyle === 'two-tone' ? chroma(barColor).brighten(1) : barColor
		)
	}

	// On changes from a lollipop back to a bar chart
	// resets the bar height to 25.
	useEffect(() => {
		if (config.isLollipopChart === false) {
			updateConfig({ ...config, barHeight: 25 })
		}
	}, [config.isLollipopChart]);

	return { lollipopBarWidth, lollipopShapeSize, handleBarColor };
}
export default useLollipopChart;
