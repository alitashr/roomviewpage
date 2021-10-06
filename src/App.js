import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';
import RoomStudioPage from './components/pages/RoomStudioPage';
import { Provider } from 'react-redux';
import store from './redux/store';
import BorderRugsPage from './components/pages/BorderRugsPage';

const PageToRender = props=>{
  const template = sessionStorage.getItem("template") ||'roomview';
  switch (template){
    case "page13":
      return <RoomStudioPage></RoomStudioPage>
    case "roomview":
      return <RoomViewPage></RoomViewPage>
      case "borderrugs":
        return <BorderRugsPage></BorderRugsPage>
    default:
      return <RoomViewPage></RoomViewPage>
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
