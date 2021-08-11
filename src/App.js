import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';
import AllInOnePage from './components/pages/AllInOnePage';
import { useMount } from 'react-use';
import { autoLogin } from './api/appProvider';
import RoomStudioPage from './components/pages/RoomStudioPage';
import { Provider } from 'react-redux';
import store from './redux/store';

const PageToRender = props=>{
  const template = sessionStorage.getItem("template") ||'redux-test';
  switch (template){
    case "redux-test":
      return <RoomStudioPage></RoomStudioPage>
    case "page13":
      return <AllInOnePage></AllInOnePage>
    case "roomview":
      return <RoomViewPage></RoomViewPage>
    default:
      break;

  }
}
function App() {
  useMount(()=>{
    autoLogin()
    .then(key => {
    console.log("useMount -> key", key);
    
    })
  })
  return (
    <Provider store={store}>
    <div className="App">
      <PageToRender></PageToRender>
    </div>
    </Provider>
  );
}

export default App;
