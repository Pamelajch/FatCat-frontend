<script setup>
    
</script>

<template>
    <div class="page-content-wrapper pt-5 pb-5">
    <div class=" container mb-2">
        <h2>訂單結帳</h2>
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
                        <h3>送貨資料填寫</h3>
                    </li>
                    <li class="list-group-item">送貨方式:
                    <div>
                       <select class="form-select form-select-sm" aria-label=".form-select-sm example">
                        <option selected>請選擇送貨方式</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                        </select>

                    </div>
                    </li>
                    <li class="list-group-item">收件人姓名:
                    <div>
                        <input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
                    </div>
                    </li>
                    <li class="list-group-item">收件人電話:
                    <div>
                        <input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
                    </div>
                    </li>
                  <li class="list-group-item">
                    <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="sameAsMember">
                    <label class="form-check-label" for="sameAsMember">
                        同會員資料填入
                    </label>
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
                        <h3>付款資料</h3>
                    </li>
                    <li class="list-group-item">使用優惠券:
                    <div>
                         <select class="form-select form-select-sm" aria-label=".form-select-sm example">
                        <option selected>請選擇優惠</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                        </select>
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
                <router-link to="/checkoutfinish">
                    <button type="button" class="btn btn-primary float-end">確定結帳</button>
                </router-link>
                
                <router-link to="/cart">
                        <button type="button" class="btn btn-secondary float-end">購物車確認</button>
                        </router-link>
                
            </div>
            
                        
        </div>
    </div>
</div>
</template>

<style lang="css" scoped>

</style>




