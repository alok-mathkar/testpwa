if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(function(){
        console.log('Service worker registered')
    });
}

$(function(){
    customSelect();
    xmlData();
    //populateData();
    var appHtml = $('.form-rowBody .form-row').html();
    $('.addmore').click(function(){
        if (!$(this).hasClass('disabled')) {
            $(this).parents('.form-rowBody').find('.form-row').length;
            $("<div class='form-row'>"+appHtml+"</div>").insertBefore($(this));
            if ($(this).prev().find('.caratVal').text() =='' && $(this).prev().find('.inputWrap input').val() =='') {
                $(this).addClass('disabled')
            }
            if($(this).parents('.form-rowBody').find('.form-row').length>=10){
                $(this).hide();
            }
            $('.close').show();
        }
    });
    $(document).on('click','.close',function(){
        $(this).parent().remove();
        calculateGraph();
        if($('.form-row').length==2){
            $('.close').hide();
        }
    });
    $(document).on('keypress','.weight', function(e){
        
        if(!(e.keyCode >= 48 && e.keyCode <=57) || (e.keyCode >= 96 && e.keyCode <=105)){
            return false;
        }         
    });
    $('.disclaimerclick').click(function(){
        $('.disclaimerPopUp,.popOverlay').fadeIn();
    });
     $('.closepopup').click(function(){
        $('.disclaimerPopUp,.popOverlay').fadeOut();
    });
    
});

function xmlData(){
    var url = window.location.href;
    var url = url.substring(0, url.lastIndexOf("/") + 1);
    var request = new XMLHttpRequest();

    request.open("GET", url+"GetGoldLoanRates.ashx", false);
    request.send();
    var rateObj =[];
    var xml = request.responseXML;
     $(xml).find('GoldLoan Rates').each(function(){
        var strobj = '{"carat":"'+$(this).find("Carrat").text()+'","rate":"'+$(this).find("Rate_Per_Gram").text()+'"}'
        rateObj.push(JSON.parse(strobj));
     })
   populateData(rateObj);
}

function populateData(rateObj){
    var rateList = rateObj;

    for (var i = 0; i < rateList.length; i++) {
        $('.carat').append("<option data-rate='"+rateList[i].rate+"'>"+rateList[i].carat+"</option>");
    }

    $(document).on('blur','.weight',function(){        
        var index = $(this).parents('.form-row').index();
        var weight = $(this).val();
        var rate = $(this).parents('.form-row').find('.caratVal').attr('data-rate');
        $('.inputWrap span').remove();  
        if (weight>=1 && weight<=500) {            
            $(this).parent().removeClass('error');            
            if($(this).parents('.form-row').find('.caratVal').text() !=""){
                $('.addmore').removeClass('disabled');
            }
            calculateLoan(weight,rate,index);

        }else{
            $('.inputWrap span').remove();            
            $(this).parent().addClass('error');
            if ($(this).val()>500) {
                $(this).parent().append('<span>Maximum 500gm weight allowed</span>');
            }else{
                $(this).parent().append('<span>Minimum 1gm weight required</span>');
            }
            if ($(this).val()!='' || $(this).val()!=undefined) {
               // calculateLoan(weight,0,index);

            }
            $('.addmore').addClass('disabled');
        }
    })
}

function calculateLoan(weight,rate,index){        
    var weight = weight;
    var rate = rate;
    var finalLoan = Math.round((weight*rate)*0.75);  
    $('.finalLoan').eq(index).attr('data-valText',finalLoan)  
    $('.finalLoan').eq(index).val(finalLoan.toLocaleString("hin-IN"));
    calculateGraph();
}

function calculateGraph(){
    var chData = [];
    var totalAmt = 0;    
    for(var i=0;i<$('.finalLoan').length;i++){
        if($('.finalLoan').eq(i).val()=='0' || $('.finalLoan').eq(i).val()==''){
            $('.addmore').addClass('disabled');
        }else{
            $('.addmore').removeClass('disabled');
        }
        var str = '{"name":"ornament'+parseInt(i+1)+'","y":'+parseInt($('.finalLoan').eq(i).attr('data-valText'))+'}';  
        chData.push(JSON.parse(str));
        totalAmt = parseInt(totalAmt) + parseInt($('.finalLoan').eq(i).attr('data-valText'));
        $('.ornaments-ledgend li').eq(i).fadeIn();
    }
    $('.graphs').fadeIn();    
    charts(chData, totalAmt);
}

function customSelect(){
    $('.customSelect').each(function(){
        $(this).find('.selText').text($(this).find('select option:selected').val())
    })
    $(document).on('change','.customSelect select',function(){      
        $(this).prev().text($(this).val());
        if($(this).hasClass('carat')){
            $(this).prev().attr('data-rate',$(this).find('option:selected').attr('data-rate'));
            if($(this).parents('.form-row').find('.weight').val() !="" ){
                var index = $(this).parents('.form-row').index();
                var weight = $(this).parents('.form-row').find('.weight').val();
                var rate = $(this).parents('.form-row').find('.caratVal').attr('data-rate');
                if($(this).prev().text() !=""){
                    $('.addmore').removeClass('disabled');
                }
                calculateLoan(weight,rate,index);                
            }
        }
        if($(this).hasClass('tenure')){
            if ($(this).prev().text()!='Select') {
                $('.formSection').fadeIn();
            }
        }
    })

}

function charts(chartData,totalAmt){
    Highcharts.chart('graphsContainer', {
    exporting: { enabled: false },
    colors: ['#ff615f', '#fdbc01', '#3ec5f3', '#6f9eee', '#ff615f', '#465766', '#ff70ab', '#40ec9a','#f3942e','#227e90'],   
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        events:{
            load: function(event) {
                var htmlstr='<div class="totalLabel"> <label>Eligible Gold</label> <label>Loan Amount</label> <span class="amount">6,71,057</span> </div>'
                $('#graphsContainer').append(htmlstr);
                $('.highcharts-background').attr('fill','none');                
                var result = parseInt(totalAmt);
                $('.amount').html('<strong>&#8377;</strong>'+ result.toLocaleString("hin-IN"));
                /*$('.amount').counterUp({
                    delay: 10,
                    time: 500
                });*/
                
            }
        }
    },
    tooltip: { enabled: true,
            formatter: function () {
                // display only if larger than 1
                //console.log(this.series.name)
                return '<b>'+this.key+'</b><br> Loan Amount: <b>' + this.y.toLocaleString("hin-IN") + '</b>';
            }
     },

    title: {
        text: 'Eligible Gold <br> Loan Amount',
        align: 'center',
        verticalAlign: 'middle',
        y: -90,
        style:{
            display:'none'
        }
        
    },
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: true,
                distance: 10,
                style: {
                    fontWeight: 'normal',
                    color: 'black'
                }
            },
            startAngle: 0,
            endAngle: 360,
            center: ['50%', '35%']
        }
    },
    series: [{
        type: 'pie',
        name: 'Loan Amount',
        innerSize: '80%',
        data: chartData,
        dataLabels: {
            formatter: function () {
                // display only if larger than 1
                // console.log(chartData)
                //return this.y > 1 ? Math.round(this.point.percentage) + '%' : null;
            }
        }
    }]
});


}