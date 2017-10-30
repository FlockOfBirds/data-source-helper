import "./ui/DataSourceHelper.scss";

interface ConstraintStore {
    constraints: { [widgetId: string]: string | OfflineConstraint; };
    sorting: { [widgetId: string]: string[] };
}

export interface Version {
    major: number;
    minor: number;
    patch: number;
}

export interface OfflineConstraint {
    attribute: string;
    operator: string;
    value: string;
    path?: string;
}

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: OfflineConstraint[] | string;
        _entity: string;
        _sorting: string[][];
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    sequence: (sequence: string[], callback?: () => void) => void;
    _entity: string;
    __customWidgetDataSourceHelper?: DataSourceHelper;
}

export class DataSourceHelper {
    // The version of a Datasource is static, it never changes.
    static VERSION: Version = { major: 1, minor: 0, patch: 0 };
    // Expose the version dataSourceHelper instances.
    public version: Version = DataSourceHelper.VERSION;
    private delay = 50;
    private timeoutHandle?: number;
    private store: ConstraintStore = { constraints: {}, sorting: {} };
    private widget: ListView;
    private updateInProgress = false;
    private requiresUpdate = false;
    private widgetVersionRegister: {
        [version: string]: string[];
    } = {};

    constructor(widget: ListView, widgetId: string) {
        this.widget = widget;
        this.widgetVersionRegister[`${this.version.major}`] = [ widgetId ];
        this.compatibilityCheck();
        this.showLoader();
    }

    setSorting(widgetId: string, sortConstraint: string[]) {
        this.store.sorting[widgetId] = sortConstraint;
        this.registerUpdate();
    }

    setConstraint(widgetId: string, constraint: string | OfflineConstraint) {
        this.store.constraints[widgetId] = constraint as string | OfflineConstraint;
        this.registerUpdate();
    }

    registerUpdate() {
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }
        if (!this.updateInProgress) {
            this.timeoutHandle = window.setTimeout(() => {
                this.updateInProgress = true;
                // TODO Check if there's currently no update happening on the listView coming from another
                // Feature/functionality/widget which does not use DataSourceHelper
                this.iterativeUpdateDataSource();
          }, this.delay);
        } else {
            this.requiresUpdate = true;
        }
    }

    private iterativeUpdateDataSource() {
        this.updateDataSource(() => {
            if (this.requiresUpdate) {
                this.requiresUpdate = false;
                this.iterativeUpdateDataSource();
            } else {
                this.updateInProgress = false;
            }
        });
    }

    versionCompatibility(version: Version, widgetId: string): string {
        this.widgetVersionRegister[`${version.major}`] = this.widgetVersionRegister[`${version.major}`] || [];
        this.widgetVersionRegister[`${version.major}`].push(widgetId);
        const maxVersion = Math.max(...Object.keys(this.widgetVersionRegister).map(value => Number(value)));

        if (maxVersion !== version.major) {
            const widgetsToUpdate = { ...this.widgetVersionRegister };
            delete widgetsToUpdate[`${maxVersion}`];
            const widgetsToUpdateList = Object.keys(widgetsToUpdate).map(key => widgetsToUpdate[key]).join(",");

            return `Update widgets: ${widgetsToUpdateList} to version ${maxVersion}`;
        }

        return "";
    }

    private compatibilityCheck() {
        if (!(this.widget._datasource && this.widget._datasource._constraints !== undefined && this.widget._entity
                && this.widget.update && this.widget.datasource.type)) {
            throw new Error("Mendix version is incompatible");
        }
    }

    private updateDataSource(callback: () => void) {
        let constraints: OfflineConstraint[] | string;
        const sorting: string[][] = Object.keys(this.store.sorting)
            .map(key => this.store.sorting[key])
            .filter(sortConstraint => sortConstraint[0] && sortConstraint[1]);

        if (window.mx.isOffline()) {
            constraints = Object.keys(this.store.constraints)
                .map(key => this.store.constraints[key] as OfflineConstraint)
                .filter(mobileConstraint => mobileConstraint.value);
        } else {
            constraints = Object.keys(this.store.constraints)
                .map(key => this.store.constraints[key]).join("");
        }

        this.widget._datasource._constraints = constraints;
        this.widget._datasource._sorting = sorting;
        this.showLoader();
        this.widget.update(null, () => {
           this.hideLoader();
           callback();
        });
    }

    private showLoader() {
        this.widget.domNode.classList.add("widget-data-source-helper-loading");
    }

    static hideContent(targetNode: HTMLElement) {
        targetNode.classList.add("widget-data-source-helper-initial-loading");
    }

    private hideLoader() {
        this.widget.domNode.classList.remove("widget-data-source-helper-loading");
        this.widget.domNode.classList.remove("widget-data-source-helper-initial-loading");
    }

}
