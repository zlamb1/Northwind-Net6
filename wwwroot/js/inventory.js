$(async function()
{
    let products = await loadProducts(); 
    renderProducts((a, b) => 
    {
        if (a.unitsInStock == 0)
            return -1; 
        if (b.unitsInStock == 0)
            return 1;
        return (a.unitsInStock - a.reorderLevel) - (b.unitsInStock - b.reorderLevel); 
    });

    async function loadProducts()
    {
        return await $.getJSON({
            url: `../../api/product/discontinued/false/`,
            error: function (jqXHR, textStatus, errorThrown) 
            {
                // log the error to the console
                console.log("The following error occured: " + textStatus, errorThrown);
            }
        });
    }
    
    function renderProducts(sort)
    {
        $('#product_rows').html("");

        products.sort(sort);
        for (var i = 0; i < products.length; i++)
        {
            var category = ""; 
            var css = "";

            if (products[i].unitsInStock < products[i].reorderLevel)
            {
                css = "medium-stock";
            }

            if (products[i].unitsInStock == 0)
            {
                css = "low-stock";
            }

            var row = `<tr data-id="${products[i].productId}" data-name="${products[i].productName}" data-price="${products[i].unitPrice}" style="user-select:none;">
                <td class="${css}">${products[i].productName}</td>
                <td class="text-right ${css}">${products[i].category.categoryName}</td>
                <td class="text-right ${css}">${products[i].unitsInStock}</td>
                <td class="text-right ${css}">${products[i].reorderLevel}</td>
            </tr>`;

            $('#product_rows').append(row);
        }
    }

    $('#unitsHeader').on('click', function()
    {
        let icon = $(this).children('i');
        if (icon.hasClass('fa-angle-down'))
        {
            icon.removeClass('fa-angle-down').addClass('fa-angle-up');
            renderProducts((a, b) => b.unitsInStock - a.unitsInStock);
        }
        else
        {
            icon.removeClass('fa-angle-up').addClass('fa-angle-down');
            renderProducts((a, b) => a.unitsInStock - b.unitsInStock);
        }
    });
});