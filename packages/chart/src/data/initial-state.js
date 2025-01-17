export default {
  type: 'chart',
  title: '',
  theme: 'theme-blue',
  fontSize: 'medium',
  lineDatapointStyle: 'hover',
  barHasBorder: 'false',
  padding: {
    left: 5,
    right: 5
  },
  yAxis: {
    size: 50,
    gridLines: false
  },
  barThickness: 0.35,
  height: 300,
  xAxis: {
    type: 'categorical',
    size: 75,
    tickRotation: 0
  },
  table: {
    label: 'Data Table',
    expanded: true
  },
  legend: {
    behavior: 'isolate',
    position: 'right'
  },
  exclusions: {
    active: false,
    keys: []
  },
  palette: 'qualitative-bold',
  labels: false,
  dataFormat: {},
  confidenceKeys: {}
}
