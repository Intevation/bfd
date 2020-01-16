# README

## Konvertierung von xlsx nach csv

Import from UTF-8, Language German, Comma separated, Text delimiter ", Quoted
field as text:

IMPORTANT! : --convert-to converts only the first sheet!!!

```shell
libreoffice --headless --unaccept=accept-string --convert-to csv:"Text - txt - csv (StarCalc)":44,34,76,1,,1031,true,true einsatzstellen.xlsx
```
Alternative <https://github.com/dilshod/xlsx2csv> :
```shell
xlsx2csv -s 2 -q all einsatzstellen.xlsx > einsatzstellen.csv
```

- 44 the comma
- 34 the double quote character ASCII value.
- 76 is the number of the UTF-8 encoding
- For details of the filter options see: <https://wiki.openoffice.org/wiki/Documentation/DevGuide/Spreadsheets/Filter_Options#Filter_Options_for_the_CSV_Filter>

## Alternative 
https://github.com/dilshod/xlsx2csv

## Geocodierung

```shell
HEREAPPID=XXXXXXXXXXXXXXXXXXXX HEREAPPCODE=XXXXXXXXXXXXXXXXXXXXXX /opt/geocodify/geocodify.js --source=here --addressfields ["Einsatzstelle Adresse"] einsatzstellen.csv > einsatzstellen-geocodify.csv
```

## Umwandeln nach GeoJSON

```shell
ogr2ogr -f "GeoJSON" einsatzstellen.geojson einsatzstellen-geocodify.csv -oo X_POSSIBLE_NAMES=lon -oo Y_POSSIBLE_NAMES=lat -nln einsatzstellen -oo KEEP_GEOM_COLUMNS=NO
```

## Daten 

- https://owncloud.nabu.de

