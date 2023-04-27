$(function()
{
    getProducts((a, b) => 
    {
        if (a.unitsInStock == 0)
            return -1; 
        if (b.unitsInStock == 0)
            return 1;
        return (a.unitsInStock - a.reorderLevel) - (b.unitsInStock - b.reorderLevel); 
    });

    async function getCategory(categoryId)
    {
        const data = await $.getJSON({
            url: `../../api/category/name/${categoryId}/`,
            success: function(response, textStatus, jqXhr)
            {
                categoryName = response.categoryName; 
            },
            error: function(jqXHR, textStatus, errorThrown) 
            { 
                // log the error to the console
                console.log("The following error occured: " + textStatus, errorThrown);
            }
        });

        return data.categoryName; 
    }

    async function getProducts(sortFunction)
    {
        $.getJSON({
            url: `../../api/product/discontinued/false/`,
            success: async function (response, textStatus, jqXhr) 
            {
                $('#product_rows').html("");
                response.sort(sortFunction);
                for (var i = 0; i < response.length; i++)
                {
                    var categoryName = await getCategory(response[i].categoryId);
                    var stockCSS = "";
                    if (response[i].unitsInStock < response[i].reorderLevel)
                    {
                        stockCSS = "medium-stock";
                    }
                    if (response[i].unitsInStock == 0)
                    {
                        stockCSS = "low-stock";
                    }

                    var row = `<tr data-id="${response[i].productId}" data-name="${response[i].productName}" data-price="${response[i].unitPrice}" style="user-select:none;">
                        <td class="${stockCSS}">${response[i].productName}</td>
                        <td class="${stockCSS}">${categoryName}</td>
                        <td class="text-right ${stockCSS}">${response[i].unitsInStock}</td>
                        <td class="text-right ${stockCSS}">${response[i].reorderLevel}</td>
                    </tr>`;
                    $('#product_rows').append(row);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) 
            {
                // log the error to the console
                console.log("The following error occured: " + textStatus, errorThrown);
            }
        });
    }

    $('#unitsHeader').on('click', function()
    {
        let icon = $(this).children('i');
        if (icon.hasClass('fa-angle-down'))
        {
            icon.removeClass('fa-angle-down').addClass('fa-angle-up');
            getProducts((a, b) => b.unitsInStock - a.unitsInStock);
        }
        else
        {
            icon.removeClass('fa-angle-up').addClass('fa-angle-down');
            getProducts((a, b) => a.unitsInStock - b.unitsInStock);
        }
    });
});