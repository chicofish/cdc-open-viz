import React, { useContext, useState } from 'react';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { BarGroupHorizontal, Bar } from '@visx/shape';
import Context from '../context';
import useLollipopChart from './../hooks/useLollipopChart';
import chroma from 'chroma-js';

const HorizontalBarChart = ({width, height, xScale, yScale, seriesScale}) => {

	const { transformedData: data, config, colorScale, formatNumber, seriesHighlight } = useContext(Context);
	const { lollipopShapeSize, lollipopBarWidth } = useLollipopChart();

	// Kind of akward, we have config.barHeight but I think it's getting changed by yScale
	// This is used to retreive the true bar height so we can add text below the bars
	//const [ localBarHeight, setLocalBarHeight ] = useState(null)

	// Padding on labels inner/outer on bars.
	const barTextPadding = 5;
	
	/**
	 * todo: change Horizontal Bar Group from band
	 * todo: fix/add lollipop items
	 * todo: display numbers on bar / after bar lollipop change
	 * todo: animations!
	 */

	let categoryKey = config.xAxis.dataKey;
	const keys = config.series.map( series => series.dataKey);
	const getCategoryScale = (data) => data[categoryKey]

	// used to offset bars - 1 comes from the line width.
	let horizontalBarOffset = config.yAxis.size;

	// font size and text spacing used for centering text on bar
	let horizBarLabelPadding = null;
	if (config.fontSize === "small") {
		horizBarLabelPadding = 16;
	} else if (config.fontSize === "medium") {
		horizBarLabelPadding = 18;
	} else {
		horizBarLabelPadding = 20;
	}

	// Restrict min height of horizontal bar to 25.
	React.useEffect(() => {
		if(config.barHeight <= 25) {
			config.barHeight = 25
		}
	}, [config]);

	return width > 0 && (
		<>
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
						xScale={xScale}
					>
						{(barGroups) =>
							barGroups.map((barGroup, barGroupIndex) => {
								//console.log('barGroup', barGroup)
								return (
									<>
									<Group
										key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
										top={barGroup.y0}
									>
									{barGroup.bars.map((bar, index) => {

										//setLocalBarHeight(bar.height)

										// Label Settings
										const isLabelOnBar = config.yAxis.displayNumbersOnBar === true;
										const isLabelBelowBar = config.yAxis.labelPlacement === "Below Bar";
										const isLabelOnYAxis = config.yAxis.labelPlacement === "On Date/Category Axis";
										const isLabelMissing = !config.yAxis.labelPlacement;


										// Set label color
										let labelColor = "#000000";
										if (chroma.contrast(labelColor, bar.color) < 4.9) {
											labelColor = '#FFFFFF';
										}
										
										// Tooltips
										let yAxisValue = formatNumber(bar.value);
										let xAxisValue = data[barGroup.index][config.runtime.originalXAxis.dataKey];
										let yAxisTooltip = config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${yAxisValue}` : yAxisValue
										let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue
										const tooltip = `<div>
														${yAxisTooltip}<br />
														${xAxisTooltip}<br />
														${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

										// Bar Settings
										let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1;
										let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1;

										const barsPerGroup = config.series.length;
										let barHeight = config.barHeight ? config.barHeight : 25;

										if (isLabelBelowBar || isLabelMissing || isLabelOnYAxis) {
											if (barHeight < 40) {
												config.barPadding = 30;
											} else {
												config.barPadding = 30;
											}
										} else {
											config.barPadding = 30;
										}

										//config.barPadding = barPadding + barTextPadding;

										if (config.isLollipopChart && config.yAxis.labelPlacement === 'Below Bar') {
											config.barPadding = config.barPadding + 7;
										}
										
										// If lollipop chart type use lollipop width.
										config.barHeight = config.isLollipopChart ? lollipopBarWidth : barHeight;

										config.height = (barsPerGroup * barHeight) * barGroups.length + (config.barPadding * barGroups.length);

										
										return (
											<>
												<Bar
													className="bar"
													key={`horizontal_bar--${index}--${barGroupIndex}`}
													x={bar.x + horizontalBarOffset + 5}
													y={ barHeight * (barGroup.bars.length - bar.index - 1)  }
													width={bar.width}
													height={barHeight}
													fill={bar.color}
													stroke="#333"
													//strokeWidth={config.barBorderThickness || 1}
													opacity={transparentBar ? 0.5 : 1}
													display={displayBar ? 'block' : 'none'}
													data-tip={tooltip}
													data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
												/>

												{/* Lollipop Shapes: circle */}
												{ config.isLollipopChart && config.lollipopShape === 'circle' &&
													<circle
														cx={bar.width + config.yAxis.size }
														cy={bar.height }
														r={lollipopShapeSize}
														fill={bar.color}
														key={`circle--${bar.index}`}
														data-tip={tooltip}
														data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
														style={{ 'opacity': 1, filter: 'unset' }}
													/>
												}

												{/* Lollipop Shapes: square */}
												{config.isLollipopChart && config.lollipopShape === 'square' &&
													<rect
														x={ bar.width + config.yAxis.size}
														y={ bar.height }
														width={lollipopShapeSize}
														height={lollipopShapeSize}
														fill={bar.color}
														key={`circle--${bar.index}`}
														data-tip={tooltip}
														data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
														style={{ 'opacity': 1, filter: 'unset' }}
													/>
												}

												{/* Label On Bar > Long Bars > Labels appear inside of bar */}
												{(bar.width > 50 && isLabelOnBar) &&
													<Group key={`group--${barGroupIndex}-${bar.index}`}>
														<Text
															x={ bar.width + config.yAxis.size - barTextPadding }
															y={bar.height / 2 + (bar.height * bar.index) } //  bar.height/2 === (center on bar). bar.Height * bar.index() === the y position of bar
															textAnchor="end"
															verticalAnchor="middle"
															opacity={transparentBar ? 0.5 : 1}
															display={displayBar ? 'block' : 'none'}
															fill={labelColor}
														>
															{yAxisValue}
														</Text>
													</Group>
												}
												
												{/* Label On Bar > Short Bars > Labels appear to the right of the bar */}
												{ (bar.width < 50 && isLabelOnBar) &&
													<Group key={`key--${barGroupIndex}-${bar.index}`}>
														<Text
															x={ bar.width + config.yAxis.size + barTextPadding }
															y={ bar.height/2 + (bar.height * bar.index) }
															fill={'#333333'}
															textAnchor="start"
															verticalAnchor="middle"
															opacity={transparentBar ? 0.5 : 1}
															display={displayBar ? 'block' : 'none'}
														>
															{yAxisValue}
														</Text>
													</Group>
												}
											</>
										)}
									)}
									</Group>
										{/* Label Below Bar */}
										{config.yAxis.labelPlacement === 'Below Bar' &&
											<Text
												x={0 + config.yAxis.size + barTextPadding } // padding
												y={barGroup.y0 + (barGroup.bars.length + 12 ) + barTextPadding }
												verticalAnchor={"end"}
												key={`text--${data[barGroup.index][config.runtime.originalXAxis.dataKey]}`}
												textAnchor={"start"}
											>
												{data[barGroup.index][config.runtime.originalXAxis.dataKey]}
											</Text>
										}
									</>
								)
							}
							)
						}
					</BarGroupHorizontal>
				)
			</Group>
		</>
	);
}

export default HorizontalBarChart;
