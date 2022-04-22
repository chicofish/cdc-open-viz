import React, { useContext, FC } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { Text } from '@visx/text';

import Context from '../context';
import chroma from 'chroma-js';


interface PairedBarChartProps {
	width: number,
	height: number
}

interface group {
	parentKey: string,
	dataKey: string,
	color: string,
	max: number,
	labelColor: string
}

const PairedBarChart: React.FC<PairedBarChartProps> = ({ width, height }) => {

	const { config, colorScale, transformedData } = useContext<any>(Context);

	if(!config || config?.series?.length < 2) return;

	
	const data = transformedData
	const adjustedWidth = width;
	const adjustedHeight = height;
	const halfWidth = adjustedWidth / 2;
	let labelColor = '#000000';


	const groupOne: group = {
		parentKey: config.dataDescription.seriesKey,
		dataKey: config.series[0].dataKey,
		color: colorScale(config.runtime.seriesLabels[config.series[0].dataKey]),
		max: Math.max.apply(Math, data.map(item => item[config.series[0].dataKey])),
		labelColor: chroma.contrast(labelColor, colorScale(config.runtime.seriesLabels[config.series[0].dataKey]) ) < 4.9 ? '#FFFFFF' : labelColor
	}

	const groupTwo: group = {
		parentKey: config.dataDescription.seriesKey,
		dataKey: config.series[1].dataKey,
		color: colorScale(config.runtime.seriesLabels[config.series[1].dataKey]),
		max: Math.max.apply(Math, data.map(item => item[config.series[1].dataKey])),
		labelColor: chroma.contrast(labelColor, colorScale(config.runtime.seriesLabels[config.series[0].dataKey]) ) < 4.9 ? '#FFFFFF' : labelColor
	}
	
	const xScale = scaleLinear({
		domain: [0, Math.max(groupOne.max, groupTwo.max)],
		range: [0, halfWidth]
	});


	const yScale = scaleBand({
		range: [0, adjustedHeight],
		domain: data.map(d => d[config.dataDescription.xKey]),
		padding: 0.2
	});

	const barToolTip = (config, group: group, data) => {
		return (
			`<p>
				${config.dataDescription.seriesKey ? config.dataDescription.seriesKey + ':': null } ${group.dataKey && group.dataKey}<br/>
				${config.xAxis.dataKey ? config.xAxis.dataKey + ':' : null} ${data[config.xAxis.dataKey] && data[config.xAxis.dataKey]}<br/>
				${config.dataDescription.valueKey ? config.dataDescription.valueKey + ':' : null} ${data[group.dataKey] && data[group.dataKey]}
			</p>`
		)
	}

	return (width > 0) && (
		<>
			<svg
				id="cdc-visualization__paired-bar-chart"
				width={width}
				height={height}>
				<Group top={0} left={config.xAxis.size}>
					{data.filter(item => config.series[0].dataKey === groupOne.dataKey).map(d => {
						let barWidth = (xScale(d[config.series[0].dataKey]))
						return (
						<Group key={`group-${groupOne.dataKey}-${d[config.xAxis.dataKey]}`}>
							<Bar
								className="bar"
								key={`bar-${groupOne.dataKey}-${d[config.dataDescription.xKey]}`}
								x={halfWidth - barWidth}
								y={yScale([d[config.dataDescription.xKey]])}
								width={xScale(d[config.series[0].dataKey])}
								height={yScale.bandwidth()}
								fill={groupOne.color}
								data-tip={ barToolTip(config, groupOne, d) }
								data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
							/>
							<Text
								textAnchor={barWidth < 100 ? 'end' : 'start' }
								x={halfWidth - (barWidth < 100 ? barWidth + 10 : barWidth - 5)}
								y={yScale([d[config.dataDescription.xKey]]) + yScale.bandwidth() / 1.5}
								fill={barWidth > 100 ? groupOne.labelColor : '#000' }>
								{d[config.dataDescription.xKey]}
							</Text>
						</Group>
					)}
					)}
					{data.filter(item => config.series[1].dataKey === groupTwo.dataKey).map(d => {
						let barWidth = (xScale(d[config.series[1].dataKey]))
						return(
							<Group key={`group-${groupTwo.dataKey}-${d[config.dataDescription.xKey]}`}>
								<Bar
									className="bar"
									key={`bar-${groupTwo.dataKey}-${d[config.dataDescription.xKey]}`}
									x={halfWidth}
									y={yScale([d[config.dataDescription.xKey]])}
									width={xScale(d[config.series[1].dataKey])}
									height={yScale.bandwidth()}
									fill={groupTwo.color}
									data-tip={ barToolTip(config, groupTwo, d) }
									data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}

								/>
								<Text
									textAnchor={barWidth < 100 ? 'start' : 'end' }
									x={halfWidth + (barWidth < 100 ? barWidth + 10 : barWidth - 10 )}
									y={yScale([d[config.dataDescription.xKey]]) + (yScale.bandwidth() / 1.5)}
									fill={barWidth > 100 ? groupTwo.labelColor : '#000' }>
									{d[config.dataDescription.xKey]}
								</Text>
							</Group>
						)
					}
					)}
				</Group>
			</svg>
		</>
	);
}

export default PairedBarChart;
