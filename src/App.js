import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';
import AllInOnePage from './components/pages/AllInOnePage';
import { useMount } from 'react-use';
import { autoLogin } from './api/appProvider';

const PageToRender = props=>{
  const template = sessionStorage.getItem("template") ||'page13';
  switch (template){
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
    <div className="App">
      <PageToRender></PageToRender>
    </div>
  );
}

export default App;
