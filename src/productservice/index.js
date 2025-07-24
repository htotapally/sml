module.exports = {
  OTLPLogExporter: require('@opentelemetry/exporter-logs-otlp-http'),
  ...require('@opentelemetry/api')
}
