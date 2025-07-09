<script setup>
    
</script>

<template>
    <div class="page-content-wrapper pt-5 pb-5">
    <div class=" container mb-2">
        <h2>訂單明細</h2>
        <div class="accordion col-lg-10 container mb-5" id="accordionPanelsStayOpenExample" >
  <div class="accordion-item">
    <h2 class="accordion-header" id="panelsStayOpen-headingOne">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
        <h3>購物車</h3>
      </button>
    </h2>
    <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
      <div class="accordion-body">
        
                 </div>
              </div>
            </div>
         </div>
    </div>

<div class="container">
        <div class="row">
            <div class=" col-12 col-md-4">
                <div class="row mb-3 g-0">
                    <div class="col-12 col-lg-4">
                      
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">
                        <h3>個人資料</h3>
                    </li>
                    <li class="list-group-item">姓名:
                    <div>

                    </div>
                    </li>
                    <li class="list-group-item">電話:
                    <div>
                        
                    </div>
                    </li>
                    <li class="list-group-item">Email:
                    <div>
                        
                    </div>
                    </li>
                </ul>
                    
                </div>
            </div>
            
            <div class="col-12 col-md-4">
                <div class="row mb-3 g-0">
                    <div class="col-12 col-lg-4">
                       
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">
                        <h3>送貨資料</h3>
                    </li>
                    <li class="list-group-item">訂單狀態:
                    <div>

                    </div>
                    </li>
                    <li class="list-group-item">物流狀態:
                    <div>

                    </div>
                    </li>
                    <li class="list-group-item">送貨方式:
                    <div>

                    </div>
                    </li>
                    <li class="list-group-item">收件人姓名:
                    <div>
                        
                    </div>
                    </li>
                    <li class="list-group-item">收件人電話:
                    <div>
                        
                    </div>
                    </li>
                  <!-- <li class="list-group-item">
                    <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="sameAsMember">
                    <label class="form-check-label" for="sameAsMember">
                        同會員資料填入
                    </label>
                    </div>
                </li> -->
                </ul>
                    
                </div>

                

            </div>
            <div class="col-12 col-md-4">
                <div class="row mb-3 g-0">
                    <div class="col-12 col-lg-4">
                       
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">
                        <h3>付款資料</h3>
                    </li>
                    <li class="list-group-item">使用優惠券:
                    <div>
                        
                    </div>
                    </li>
                    <li class="list-group-item">訂單總金額:
                    <div>
                        <br>
                        折扣金額:
                        <hr>
                        實付金額:
                    </div>
                    </li>
                  
                </ul>
                    
                </div>

                
                
            </div>
            <div>
                
                <button type="button" class="btn custom-purple-btn float-end">聯絡我們</button>
                <button type="button" class="btn btn-danger float-end btn-space">取消訂單</button>
                <router-link to="/myorders">
                        <button type="button" class="btn custom-purple-outline-btn float-end btn-space">返回我的訂單</button>
                        </router-link>
                
            </div>
            
                        
        </div>
    </div>
    </div>
</template>

<style lang="css" scoped>
.custom-purple-btn {
  background-color: #92559c;
  border-color: #92559c;
  color: white;
}

.custom-purple-btn:hover {
  background-color: #7b4583; /* 可選的 hover 色 */
  border-color: #7b4583;
}

.custom-purple-outline-btn {
  background-color: transparent;
  border: 2px solid #92559c;
  color: #92559c;
  transition: all 0.3s ease;
}

.custom-purple-outline-btn:hover {
  background-color: #92559c;
  color: white;
  border-color: #92559c;

  
}

.btn-space {
  margin-right: 10px; /* 可以依需求微調距離 */
}
</style>




