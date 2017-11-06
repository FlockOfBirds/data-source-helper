# data-source-helper
Mendix widget data source helper

#Usage.

* Install as npm module.
```
npm install --save mendix-data-source-helper
```

* Import `DataSourceHelper` into your component.
```
import DataSourceHelper from "DataSourceHelper"
```
* Initialize the dataSourceHelper once you've a listview
```
try {
    this.dataSourceHelper = new DataSourceHelper(targetNode, ListView, this.props.friendlyId, DataSourceHelper.VERSION)
} catch (error) {
    console.error(error.message)
} 
```

* To blur any html content from initially displaying.
```
DataSourceHelper.hideContent(htmlNode);
```
* To show (unblur) content
```
DataSourceHelper.showContent(htmlNode);
```

