<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:output method="text" indent="no" encoding="UTF-8" omit-xml-declaration="yes" />
	<xsl:template match="/">
		<xsl:value-of select="normalize-space(//forecastdays/forecastday[2]/fcttext_metric)"/>
	</xsl:template>
</xsl:stylesheet>