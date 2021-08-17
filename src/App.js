import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';
import AllInOnePage from './components/pages/AllInOnePage';
import { autoLogin } from './api/appProvider';
import RoomStudioPage from './components/pages/RoomStudioPage';
import { Provider } from 'react-redux';
import store from './redux/store';

const PageToRender = props=>{
  const template = sessionStorage.getItem("template") ||'roomview';
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
 
  return (
    <Provider store={store}>
    <div className="App">
      <PageToRender></PageToRender>
    </div>
    </Provider>
  );
}

export default App;
