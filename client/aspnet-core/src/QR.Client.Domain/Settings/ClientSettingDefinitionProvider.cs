using Volo.Abp.Settings;

namespace QR.Client.Settings;

public class ClientSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(ClientSettings.MySetting1));
    }
}
