import React, { useContext } from 'react';
import { Group } from '@visx/group';
import { BarGroupHorizontal, Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import Context from '../context';

const HorizontalBarChart = ({width, height}) => {

	const { transformedData: data, config, colorScale } = useContext(Context);
	
	
	/**
	 * todo: add Lollipop items
	 * todo: update axis/ticks in linear chart
	 */

	let categoryKey = config.xAxis.dataKey;
	let metricKey = config.series[0].dataKey;
	const keys = config.series.map( series => series.dataKey);
	console.log('max', max(data, (d) => max(keys, (key) => Number(d[key]))))

	function max(arr, fn)  {
		return Math.max(...arr.map(fn));
	}

	const getCategoryScale = (data) => data[categoryKey]


	// Metric value on max
	const xScale2 = scaleLinear({
		domain: [0, max(data, (d) => max(keys, (key) => Number(d[key])))],
		range: [0, width]
	});
	
	
	// Category value as map
	// Metric value on sort
	const yScale = scaleBand({
		domain: data.map(getCategoryScale),
		padding: 0.2
	});

	const seriesScale = scaleBand({
		domain: keys,
	});

	// update scale output dimensions
	yScale.rangeRound([0, height]);
	seriesScale.rangeRound([0, yScale.bandwidth()]);
	xScale2.rangeRound([0, width]);


	const DEBUG = true;

	if(DEBUG) {
		console.log('data', data)
		console.log('width', width)
		console.log('height', height)
		console.log('yScale @ 0', yScale(data[0][categoryKey]))
		console.log('yScale height', yScale.bandwidth())
		console.log('xScale/barwidth', xScale2(data[0][metricKey]))
		console.log('colorScale', colorScale(keys[0]))
		console.log('keys', keys)
	}

	// used to offset bars - 1 comes from the line width.
	let horizontalBarOffset = config.yAxis.size + 1;

	return width > 0 && (
		<>
		<svg
			id="cdc-visualization__horizontal-bar-chart"
			width={width}
			height={height}>
			<Group>
					return (
						<BarGroupHorizontal
							data={data}
							keys={keys}
							width={width}
							color={colorScale}
							y0={getCategoryScale}
							y0Scale={yScale}
							y1Scale={seriesScale}
							xScale={xScale2}
						>
							{(barGroups) =>
								barGroups.map((barGroup, barGroupIndex) => {
									console.log('barGroup', barGroup)
									return (
										<Group
											key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
											top={barGroup.y0}
										>
											{barGroup.bars.map((bar, index) => {
												console.log('bar', bar)
												return (
													<Bar
														className="bar"
														key={`horizontal_bar--${index}`}
														x={bar.x + horizontalBarOffset}
														y={bar.y}
														width={bar.width}
														height={bar.height}
														fill={bar.color}
													/>
												)}
											)}
										</Group>
									)
								}
								)
							}
						</BarGroupHorizontal>
					)
			</Group>
			</svg>
		</>
	);
}

export default HorizontalBarChart;
