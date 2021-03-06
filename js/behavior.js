
const StateReceiverBehavior = {
    attached: function() {
        var component = this;
        Object.keys(component.properties).forEach(function(propertyName){
            var property = component.properties[propertyName];
            if(property.linkState){
                component.set(propertyName, window.AppStateComponent.get(property.linkState));

                var setValue = function(value){
                    this.set(propertyName, value);
                }.bind(component);

                window.AppStateComponent.addWatcher(component, property.linkState, setValue);
            }
        });
    },
    detached: function(){
        window.AppStateComponent.removeWatchersForComponent(this);
    }
};

const  StateWriterBehavior = {
    getState: function(){
      console.log('---- StateWriterBehavior getState', window.AppStateComponent);
      return window.AppStateComponent;
    }
};

const StateProviderBehavior = {
    observers: [
        '_stateChanged(state.*)'
    ],
    created: function(){
      window.AppStateComponent = this;
      this.componentWatchers = [];
    },
    _stateChanged: function(changeRecord){
        this.componentWatchers.forEach(function(watcher){
            if(changeRecord.path == watcher.statePath){
                watcher.setValue(changeRecord.value);
            }
            else if(changeRecord.path.startsWith(watcher.statePath) && changeRecord.path.endsWith('.splice')){
                var value = this.get(watcher.statePath);
                watcher.setValue(value.slice());
            }
        }.bind(this));
    },
    addWatcher: function(component, statePath, setValue){
        this.componentWatchers.push({
            statePath: statePath,
            setValue: setValue,
            component: component
        });
    },
    removeWatchersForComponent: function(component){
        this.componentWatchers = this.componentWatchers.filter(function(watcher){
            return watcher.component !== component;
        });
    }
};
