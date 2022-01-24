import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';
import RoomStudioPage from './components/pages/RoomStudioPage';
import { Provider } from 'react-redux';
import store from './redux/store';

const PageToRender = props=>{
  const template = sessionStorage.getItem("template") ||'roomview';
  switch (template){
    case "page13":
      return <RoomStudioPage></RoomStudioPage>
    case "roomview":
      return <RoomViewPage></RoomViewPage>
    default:
      return <RoomViewPage></RoomViewPage>
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
