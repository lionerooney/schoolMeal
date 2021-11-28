'use strict';


// CONST DATA
const API_KEY = 'e223e6193d444423abdba3ffbccf4d62';
const KAKAOTALK_KEY = "7c0de169fa46c79103dc7e6e0347fbe1";

let schoolMealData = {
  
}

// KAKAOTALK MESSAGE
function sendLinkDefault(SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, DATE) {
  
  const url = commonMakeUrl("https://kmeal.netlify.app/", {
    SCHUL_NM: SCHUL_NM,
    ATPT_OFCDC_SC_CODE: ATPT_OFCDC_SC_CODE,
    SD_SCHUL_CODE: SD_SCHUL_CODE,
    DATE: dateObjectConvert(DATE),
  });

  try {
    Kakao.init(KAKAOTALK_KEY);
    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: `${dateObjectConvert(DATE)} ${SCHUL_NM} 급식`,
        description: "#급식",
        imageUrl: "https://kmeal.netlify.app/sunfish-icon.png",
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: "급식 보기",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
        {
          title: "사이트 보기",
          link: {
            mobileWebUrl: "https://kmeal.netlify.app",
            webUrl: "https://kmeal.netlify.app",
          },
        },
      ],
    });
    window.kakaoDemoCallback && window.kakaoDemoCallback();
  } catch (e) {
    window.kakaoDemoException && window.kakaoDemoException(e);
    alert("한 사이트당 한번 공유할 수 있습니다.")
  }
}

// url function

function commonMakeUrl(url, parament) {
  Object.keys(parament).forEach(function (key, index) {
    url += (index === 0 ? "?" : "&") + key + "=" + parament[key];
  });
  return url;
}

// date funciton

function dateConvert(stringDate) {
  const thisDate = new Date(stringDate);
  const year = thisDate.getFullYear();
  const month = thisDate.getMonth() + 1;
  const date = thisDate.getDate();
  return `${year}-${month >= 10 ? month : '0' + month}-${date >= 10 ? date : '0' + date}`;
}

function dateObjectConvert(objectDate) {
  const year = objectDate.getFullYear();
  const month = objectDate.getMonth() + 1;
  const date = objectDate.getDate();
  return `${year}-${month >= 10 ? month : "0" + month}-${date >= 10 ? date : "0" + date}`;
}

// arrow function

function arrowBtn(direction) {
  const thisDate = new Date(document.querySelector(".date").value).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const changedDate =
    direction === "right"
      ? new Date(thisDate + oneDay)
      : new Date(thisDate - oneDay);

  document.querySelector(".date").value = dateConvert(changedDate);

  pushMeal(
    document.querySelector(".cityProvince").value,
    document.querySelector(".schoolCode").value
  );
}


// local Storage functions


function saveLocalStorage(SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE) {
  localStorage.setItem("ATPT_OFCDC_SC_CODE", ATPT_OFCDC_SC_CODE);
  localStorage.setItem("SCHUL_NM", SCHUL_NM);
  localStorage.setItem("SD_SCHUL_CODE", SD_SCHUL_CODE);
}

function getLocalStorage() {
  const storagedSchoolData = {
    ATPT_OFCDC_SC_CODE: localStorage.getItem("ATPT_OFCDC_SC_CODE"),
    SCHUL_NM: localStorage.getItem("SCHUL_NM"),
    SD_SCHUL_CODE: localStorage.getItem("SD_SCHUL_CODE"),
  };
  for (let key in storagedSchoolData) {
    if (storagedSchoolData[key] === null) { return { result: false }; }
  }
  return {
    result: true,
    ATPT_OFCDC_SC_CODE: localStorage.getItem("ATPT_OFCDC_SC_CODE"),
    SCHUL_NM: localStorage.getItem("SCHUL_NM"),
    SD_SCHUL_CODE: localStorage.getItem("SD_SCHUL_CODE"),
  };

}



const loading = function (display) {
  const loadingEl = document.querySelector(".container-loading");
  loadingEl.style.display = display;
}

// school functions

const putSchoolInfo = function (SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE) {
  const putTargetEl = document.querySelector(".selectedSchoolInfo");
  putTargetEl.textContent = `${SCHUL_NM} 급식`;

  // reset Date Value
  const dateEl = document.querySelector(".date").value = dateObjectConvert(new Date());

  // display modal
  const modal = document.querySelector(".modal");  
  modal.style.display = "none";

  // put Meal Info
  pushMeal(ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE);
};

const selectSchool = function(SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE) {
  const cityProvince = document.querySelector(".cityProvince").value = ATPT_OFCDC_SC_CODE;
  const schoolName = document.querySelector(".schoolName").value = SCHUL_NM;
  const schoolCode = document.querySelector(".schoolCode").value = SD_SCHUL_CODE;

  saveLocalStorage(SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE);
  putSchoolInfo(SCHUL_NM, ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE);
}

const fetchSchoolData = async function (SCHUL_NM, ATPT_OFCDC_SC_CODE) {
  try {
    const response = await fetch(
      commonMakeUrl("https://open.neis.go.kr/hub/schoolInfo", {
        Type: "json",
        pIndex: "1",
        pSize: "30",
        key: API_KEY,
        ATPT_OFCDC_SC_CODE: ATPT_OFCDC_SC_CODE,
        SCHUL_NM: SCHUL_NM,
      })
    );
    const rawSchoolData = await response.json();
    
    if (response.status === 200) {
      if (rawSchoolData.RESULT === undefined) { // success
        const schoolRowData = rawSchoolData.schoolInfo[1].row;
        return {
          result : true,
          data : schoolRowData
        };
      } else { // fail
        return {
          result : false,
          data : rawSchoolData.RESULT
        };
      }
    } else {
      return {
        result: false,
        data: { CODE: "FETCH-ERROR", MESSAGE: "인터넷에 문제가 있거나,\n서버에 문제가 있습니다." },
      };
    }
  } catch(e) {
    return {
      result: false,
      data: { CODE: "CATCH-ERROR", MESSAGE: "알 수 없는 오류가 났습니다.", ERROR :e },
    };
  }
}

const pushSchoolData = async function (SCHUL_NM, ATPT_OFCDC_SC_CODE) {
  loading('block');
  const schoolList = document.querySelector(".schoolList");
  schoolList.innerHTML = ""; // reset school List

  const data = await fetchSchoolData(SCHUL_NM, ATPT_OFCDC_SC_CODE); // fetch school Lists
  if (data.result) {
    for (let schoolData of data.data) {
      let schoolEl = document.createElement("div");
      schoolEl.setAttribute("class", "schoolElement");
      schoolEl.setAttribute("onclick", `selectSchool("${schoolData.SCHUL_NM}", "${schoolData.ATPT_OFCDC_SC_CODE}", "${schoolData.SD_SCHUL_CODE}");`);

      schoolEl.innerHTML = `
        <div class="school-name">${schoolData.SCHUL_NM}</div>
        <div class="school-address">${schoolData.ORG_RDNMA}</div>
      `;

      schoolList.appendChild(schoolEl);
    }
    loading("none");
  } else {
    loading("none");
    alert(data.data.MESSAGE);
  }
};




// schoolMeal functions

const fetchMeal = async function (ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, findDate) {
  try {
    const response = await fetch(
      commonMakeUrl("https://open.neis.go.kr/hub/mealServiceDietInfo", {
        Type: "json",
        key: API_KEY,
        ATPT_OFCDC_SC_CODE: ATPT_OFCDC_SC_CODE,
        SD_SCHUL_CODE: SD_SCHUL_CODE,
        MLSV_YMD: findDate
      })
    );
    const rawMealData = await response.json();
    
    if (response.status === 200) {
      if (rawMealData.RESULT === undefined) { // success
        const rowMealData = rawMealData.mealServiceDietInfo[1].row;
        return {
          result : true,
          data : rowMealData
        };
      } else { // fail
        return {
          result : false,
          data : rawMealData.RESULT
        };
      }
    } else {
      return {
        result: false,
        data: { CODE: "FETCH-ERROR", MESSAGE: "인터넷에 문제가 있거나,\n서버에 문제가 있습니다." },
      };
    }
  } catch(e) {
    return {
      result: false,
      data: { CODE: "CATCH-ERROR", MESSAGE: "알 수 없는 오류가 났습니다.", ERROR :e },
    };
  }
}

const pushMeal = async function (ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE) {
  loading("block");

  const findDate = document.querySelector(".date").value.replaceAll("-","");
  const mealContainerEl = document.querySelector(".mealInfo");
  mealContainerEl.innerHTML = ""; // reset school List

  if (!(schoolMealData[`${ATPT_OFCDC_SC_CODE}_${SD_SCHUL_CODE}_${findDate}`] == undefined)) {
    pushMealToEl(schoolMealData[`${ATPT_OFCDC_SC_CODE}_${SD_SCHUL_CODE}_${findDate}`]);
  } else {
    const data = await fetchMeal(ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, findDate); // fetch Meal Data

    schoolMealData[`${ATPT_OFCDC_SC_CODE}_${SD_SCHUL_CODE}_${findDate}`] = data;
    pushMealToEl(data);
  }
  loading("none");
};

const pushMealToEl = function(data) {
  const mealContainerEl = document.querySelector(".mealInfo");
  const mealNoneEl = document.querySelector(".mealNone");

  if (!data.result) {
    mealContainerEl.style.display = "none";
    mealNoneEl.style.display = "block";
  } else {
    mealContainerEl.style.display = "flex";
    mealNoneEl.style.display = "none";
  }

  if (data.result) {
    const mealScNm = ["조식", "중식", "석식"];
    let putEls = {};
    
    for (let mealData of data.data) {
      let mealEl = document.createElement("div");
      mealEl.setAttribute("class", "mealElemenet");

      mealEl.innerHTML = `
        <span class="mealTime">
          ${mealData.MMEAL_SC_NM}
        </span>
        <p class="mealData">
          ${mealData.DDISH_NM.replace(/[.0-9]/g, "")}
          <div class="mealCaloire">
            칼로리 : ${mealData.CAL_INFO}
          </div>
        </p>  
      `;

      const putTime = mealData.MMEAL_SC_NM
      putEls[putTime] = mealEl;
    }

    for (let i of mealScNm) {
      if (putEls[i] === undefined) {
        let mealEl = document.createElement("div");
        mealEl.setAttribute("class", "mealElemenet");

        mealEl.innerHTML = `
          <span class="mealTime">
            ${i}
          </span>
          <p class="mealData">
            급식이 없습니다.
          </p>  
        `;

        putEls[i] = mealEl;
      }
    }

    for (let i of mealScNm) {
      mealContainerEl.appendChild(putEls[i]);
    }
  } else {
    mealNoneEl.textContent = data.data.MESSAGE;
  }
}





window.onload = function () {
  // reset Date Value
  const dateEl = (document.querySelector(".date").value = dateObjectConvert(
    new Date()
  ));

  const urlParaments = new URLSearchParams(location.search);
  const paraments = ["SCHUL_NM", "ATPT_OFCDC_SC_CODE", "SD_SCHUL_CODE", "DATE"];
  let parData = {};
  let parBool = true;

  for (let par of paraments) {
    const parVal = urlParaments.get(par);
    if (!(parVal === null)) {
      parData[par] = parVal;
    } else {
      parBool = false;
    }
  }
  
  if (parBool) {
    document.querySelector(".cityProvince").value = parData.ATPT_OFCDC_SC_CODE;
    document.querySelector(".schoolName").value = parData.SCHUL_NM;
    document.querySelector(".schoolCode").value = parData.SD_SCHUL_CODE;
    document.querySelector(".date").value = dateObjectConvert( new Date(parData.DATE) );
    
    const putTargetEl = document.querySelector(".selectedSchoolInfo");
    putTargetEl.textContent = `${parData.SCHUL_NM} 급식`;

    // put Meal Info
    pushMeal(parData.ATPT_OFCDC_SC_CODE, parData.SD_SCHUL_CODE);

  } else {
    // get local Storage And Select School
    const storagedValue = getLocalStorage();
    if (storagedValue.result) {
      selectSchool(
        storagedValue.SCHUL_NM,
        storagedValue.ATPT_OFCDC_SC_CODE,
        storagedValue.SD_SCHUL_CODE
      );
    }
  }



  const modal = document.querySelector(".modal");

  const schoolFindBtn = document.querySelector(".input-searchSchool");
  schoolFindBtn.addEventListener("click", function openModal() {
    const inputSchoolName = document.querySelector(".input-schoolName").value;
    const inputCityProvince = document.querySelector(
      ".input-cityProvince"
    ).value;

    if (inputSchoolName.length > 1) {
      pushSchoolData(inputSchoolName, inputCityProvince);
    } else {
      alert("학교 이름을 최소 2글자 이상 작성해주세요.");
    }
  });

  // modal OPEN CLOSE
  const modalClose = document.querySelector(".closeModalBtn");
  const modalOpen = document.querySelector(".openModalBtn");

  modalClose.addEventListener("click", function closeModal() {
    modal.style.display = "none";
  });
  modalOpen.addEventListener("click", function openModal() {
    modal.style.display = "block";
  });

  // date ARROW

  const rightArrow = document.querySelector(".meal-rightBtn");
  const leftArrow = document.querySelector(".meal-leftBtn");

  rightArrow.addEventListener("click", function dateRight() {
    arrowBtn("right");
  });
  leftArrow.addEventListener("click", function dateLeft() {
    arrowBtn("left");
  });

  // INPUT

  const input = document.querySelector(".date");

  input.addEventListener("input", function () {
    const ATPT_OFCDC_SC_CODE = document.querySelector(".cityProvince").value;
    const SD_SCHUL_CODE = document.querySelector(".schoolCode").value;
    if (!(ATPT_OFCDC_SC_CODE === SD_SCHUL_CODE === "")) {
      pushMeal(ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE);
    }
  });

  // kakaotalk share button

  const shareBtn = document.querySelector(".shareLink");
  shareBtn.addEventListener("click", function share() {
    let shareData = {};
    let shareBool = true;

    shareData.ATPT_OFCDC_SC_CODE = document.querySelector(".cityProvince").value;
    shareData.SCHUL_NM = document.querySelector(".schoolName").value;
    shareData.SD_SCHUL_CODE = document.querySelector(".schoolCode").value;
    shareData.DATE = new Date(document.querySelector(".date").value);

    for(let chk of Object.values(shareData)) {
      if(chk === null) {
        shareBool = false;
      }
    }
    
    if (shareBool) {
      sendLinkDefault(
        shareData.SCHUL_NM,
        shareData.ATPT_OFCDC_SC_CODE,
        shareData.SD_SCHUL_CODE,
        shareData.DATE
      )
    } else {
      alert("학교를 먼저 검색해주세요.");
    }
  })
  loading('none');
};

