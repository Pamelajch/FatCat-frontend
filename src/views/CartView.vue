<script setup>
    
</script>

<template>
    <div class="page-content-wrapper pt-5 pb-5">
    <div class=" container mb-2">
        <h2>購物車確認</h2>
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
            <div class=" col-12 col-md-6">
                <div class="row mb-3 g-0">
                    <div class="col-12 col-lg-6">
                      
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">
                        <h3>優惠&促銷</h3>
                    </li>
                    <li class="list-group-item">已享有優惠&可用優惠券
                    <div>

                    </div>
                    </li>
                    <li class="list-group-item">優惠促銷
                    <div>
                        指定系列滿XXX元可折XX元 再買XX元即享優惠
                    </div>
                    </li>
                </ul>
                    
                </div>
            </div>
            
            <div class="col-12 col-md-6">
                <div class="row mb-3 g-0">
                    <div class="col-12 col-lg-6">
                       
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">
                        <h3>猜你喜歡</h3>
                    </li>
                    <li class="list-group-item">
                        <div style="margin-right: 2px;">
                            <button type="button" class="btn btn-danger">Left</button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-warning">Middle</button>
                        </div>
                        
                        <div>
                            <button type="button" class="btn btn-success">Right</button>
                        </div>
                            
                        
                    </li>
                  
                </ul>
                    
                </div><router-link to="/checkout">
                        <button type="button" class="btn btn-primary float-end">前往結帳</button>
                        </router-link>
            </div>
        </div>
    </div>
    </div>
</template>

<style lang="css" scoped>

</style>